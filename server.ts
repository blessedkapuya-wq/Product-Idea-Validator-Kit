import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  type AuthenticatedRequest,
  buildSessionCookieHeader,
  checkUnlockRateLimit,
  clearUnlockFailures,
  createSessionToken,
  getServerSecurityConfig,
  getSessionFromRequest,
  recordUnlockFailure,
  requirePaidAuth,
  verifyPaidAccessKey,
} from './server/auth';
import { buildGuideHtml, generateCustomerKitZipBuffer, sanitizeWorkspaceState } from './server/kitZipGenerator';
import {
  CONVERSATION_SCRIPTS,
  DEFAULT_WORKSPACE_STATE,
  GUIDE_STEPS,
  PRESELL_TEMPLATES,
  RED_FLAGS,
  WORKED_EXAMPLES,
} from './server/paidData';

const ROOT_DIR = process.cwd();
const PUBLIC_DIST_DIR = path.resolve(ROOT_DIR, 'dist/public');
const PAID_BUNDLE_DIR = path.resolve(ROOT_DIR, 'dist/private/paid-assets');

function normalizeRequestPath(rawPath: string): string | null {
  try {
    const decoded = decodeURIComponent(rawPath);
    if (decoded.includes('\0')) return null;
    const normalized = path.posix.normalize(decoded.replace(/\\/g, '/'));
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  } catch {
    return null;
  }
}

function isProtectedGuessedAssetPath(normPath: string): boolean {
  const lower = normPath.toLowerCase();
  if (lower.startsWith('/api/paid')) return false; // Handled by requirePaidAuth router
  return (
    lower === '/paid' ||
    lower.startsWith('/paid/') ||
    lower === '/downloads' ||
    lower.startsWith('/downloads/') ||
    lower === '/paid-assets' ||
    lower.startsWith('/paid-assets/') ||
    lower.startsWith('/assets/aistudio/') ||
    lower.endsWith('.zip') ||
    lower.endsWith('.pdf')
  );
}

function isBlockedInternalPath(normPath: string): boolean {
  const lower = normPath.toLowerCase();
  return (
    lower === '/src/paid' ||
    lower.startsWith('/src/paid/') ||
    lower === '/server' ||
    lower.startsWith('/server/') ||
    lower === '/private' ||
    lower.startsWith('/private/') ||
    lower === '/dist' ||
    lower.startsWith('/dist/') ||
    lower === '/tests' ||
    lower.startsWith('/tests/') ||
    lower === '/.env' ||
    lower.startsWith('/.env.') ||
    lower.startsWith('/.git') ||
    lower === '/package.json' ||
    lower === '/package-lock.json' ||
    lower === '/bun.lock' ||
    lower === '/tsconfig.json' ||
    lower === '/vite.config.ts' ||
    lower === '/vite.paid.config.ts' ||
    lower === '/metadata.json' ||
    lower === '/server.ts'
  );
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export async function createApp(options?: { isProd?: boolean }) {
  const isProd = options?.isProd ?? process.env.NODE_ENV === 'production';
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  // Baseline security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Strict pre-static / pre-Vite guard against direct URLs, guessed paid paths, and internal files
  app.use((req: Request, res: Response, next: NextFunction) => {
    const normPath = normalizeRequestPath(req.path);
    if (!normPath) {
      res.status(400).json({ error: 'Malformed path.' });
      return;
    }

    if (
      normPath.toLowerCase() === '/biashara-base-validator-kit-source.zip' ||
      normPath.toLowerCase().includes('validator-kit-source.zip')
    ) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(404).json({ error: 'Not found.' });
      return;
    }

    if (isBlockedInternalPath(normPath)) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(404).json({ error: 'Not found.' });
      return;
    }

    if (isProtectedGuessedAssetPath(normPath)) {
      res.setHeader('Cache-Control', 'no-store, private');
      const session = getSessionFromRequest(req);
      if (!session) {
        res.status(401).json({
          error: 'Paid Member Access Key required.',
        });
        return;
      }
      res.status(404).json({ error: 'Asset not found at this path. Use /api/paid/* endpoints.' });
      return;
    }

    next();
  });

  // Public Configuration Endpoint (never exposes secrets)
  app.get('/api/public/config', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const cfg = getServerSecurityConfig();
    res.json({
      priceTsh: 15000,
      originalPriceTsh: 30000,
      priceUsd: 7,
      checkoutConfigured: cfg.checkoutConfigured,
      checkoutUrl: cfg.selarCheckoutUrl,
      accessVerificationConfigured: cfg.accessVerificationConfigured,
    });
  });

  // Auth Session Introspection
  app.get('/api/auth/session', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, private');
    const session = getSessionFromRequest(req);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      keyId: session.keyId,
      orderRef: session.ord,
    });
  });

  // Paid Member Key Verification -> HttpOnly Secure SameSite Session Cookie
  app.post('/api/auth/unlock', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, private');
    const cfg = getServerSecurityConfig();

    if (!cfg.accessVerificationConfigured || !cfg.accessKeySecret || !cfg.sessionSecret) {
      res.status(503).json({
        error: 'Paid member verification is not configured on the server yet.',
      });
      return;
    }

    const ip = getClientIp(req);
    const rateCheck = checkUnlockRateLimit(ip);
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfterSec ?? 60));
      res.status(429).json({
        error: 'Too many failed verification attempts. Please wait a few minutes and try again.',
      });
      return;
    }

    const rawKey = typeof req.body?.accessKey === 'string' ? req.body.accessKey : '';
    const result = verifyPaidAccessKey(rawKey, cfg.accessKeySecret, cfg.revokedIds);

    if (!result.ok) {
      recordUnlockFailure(ip);
      const message =
        result.reason === 'revoked'
          ? 'This Paid Member Access Key has been revoked.'
          : 'Invalid Paid Member Access Key. Check your Selar order key and try again.';
      res.status(401).json({ error: message });
      return;
    }

    clearUnlockFailures(ip);
    const sessionToken = createSessionToken(result.payload, cfg.sessionSecret);
    res.setHeader('Set-Cookie', buildSessionCookieHeader(sessionToken, false));
    res.json({
      authenticated: true,
      keyId: result.payload.id,
      orderRef: result.payload.ord,
    });
  });

  // Logout & Clear Session Cookie
  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('Set-Cookie', buildSessionCookieHeader('', true));
    res.json({ authenticated: false });
  });

  // Protected Paid Member API Router
  const paidRouter = express.Router();
  paidRouter.use(requirePaidAuth);

  paidRouter.get('/kit-data', (req: AuthenticatedRequest, res: Response) => {
    const session = req.paidSession!;
    res.json({
      session: {
        keyId: session.keyId,
        orderRef: session.ord,
        expiresAt: session.exp,
      },
      guideSteps: GUIDE_STEPS,
      conversationScripts: CONVERSATION_SCRIPTS,
      presellTemplates: PRESELL_TEMPLATES,
      workedExamples: WORKED_EXAMPLES,
      redFlags: RED_FLAGS,
      defaultWorkspaceState: DEFAULT_WORKSPACE_STATE,
    });
  });

  paidRouter.get('/examples', (_req: Request, res: Response) => {
    res.json({ workedExamples: WORKED_EXAMPLES });
  });

  paidRouter.get('/scripts', (_req: Request, res: Response) => {
    res.json({
      conversationScripts: CONVERSATION_SCRIPTS,
      presellTemplates: PRESELL_TEMPLATES,
    });
  });

  const handleGuideRequest = (req: Request, res: Response) => {
    const state = req.body?.workspaceState
      ? sanitizeWorkspaceState(req.body.workspaceState)
      : DEFAULT_WORKSPACE_STATE;
    const html = buildGuideHtml(state);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };

  paidRouter.get('/guide', handleGuideRequest);
  paidRouter.post('/guide', handleGuideRequest);

  const handleZipDownload = (req: Request, res: Response) => {
    const zipBuffer = generateCustomerKitZipBuffer(req.body?.workspaceState);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Biashara-Base-Validator-Kit.zip"');
    res.setHeader('Content-Length', String(zipBuffer.length));
    res.send(zipBuffer);
  };

  paidRouter.get('/zip', handleZipDownload);
  paidRouter.post('/zip', handleZipDownload);

  paidRouter.get('/bundle.js', (_req: Request, res: Response) => {
    const jsPath = path.join(PAID_BUNDLE_DIR, 'paid-kit.js');
    if (!fs.existsSync(jsPath)) {
      res.status(503).json({
        error: 'Paid toolkit bundle has not been built yet. Run npm run build.',
      });
      return;
    }
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(jsPath);
  });

  paidRouter.get('/bundle.css', (_req: Request, res: Response) => {
    const cssPath = path.join(PAID_BUNDLE_DIR, 'paid-kit.css');
    if (!fs.existsSync(cssPath)) {
      res.status(503).json({
        error: 'Paid toolkit stylesheet has not been built yet. Run npm run build.',
      });
      return;
    }
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.sendFile(cssPath);
  });

  paidRouter.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Paid endpoint not found.' });
  });

  app.use('/api/paid', paidRouter);

  // Unknown API routes always 404 JSON
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (isProd) {
    app.use(
      express.static(PUBLIC_DIST_DIR, {
        index: false,
        dotfiles: 'deny',
      })
    );

    // SPA fallback ONLY for extensionless navigation requests (never for missing assets or APIs)
    app.get('*', (req: Request, res: Response) => {
      if (path.posix.extname(req.path)) {
        res.status(404).json({ error: 'Not found.' });
        return;
      }
      const indexHtml = path.join(PUBLIC_DIST_DIR, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        res.status(503).send('Public bundle not built.');
        return;
      }
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(indexHtml);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  return app;
}

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const app = await createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Biashara Base server listening on http://0.0.0.0:${port}`);
  });
}

const entryHref = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entryHref) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
