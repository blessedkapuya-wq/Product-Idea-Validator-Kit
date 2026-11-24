import { createHash, timingSafeEqual } from 'node:crypto';
import {
  SESSION_COOKIE_NAME, buildSessionCookieHeader, checkUnlockRateLimit,
  clearUnlockFailures, createSessionToken, getServerSecurityConfig, parseCookieHeader,
  issuePaidAccessKey, recordUnlockFailure, verifyPaidAccessKey, verifySessionToken,
} from './server/auth';
import { buildGuideHtml, generateCustomerKitZipBuffer, sanitizeWorkspaceState } from './server/kitZipGenerator';
import {
  CONVERSATION_SCRIPTS, DEFAULT_WORKSPACE_STATE, GUIDE_STEPS,
  PRESELL_TEMPLATES, RED_FLAGS, WORKED_EXAMPLES,
} from './server/paidData';
// @ts-ignore Wrangler's build generates this private module before bundling.
import { paidJs, paidCss } from './dist/private/worker-assets.mjs';

type Env = NonNullable<Parameters<typeof getServerSecurityConfig>[0]> & {
  ZAPIER_ISSUE_SECRET?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
};

const privateHeaders = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...privateHeaders, ...headers } });
}

class InvalidBody extends Error {}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) return {};
  const decoder = new TextDecoder();
  let size = 0;
  let contents = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256 * 1024) {
        await reader.cancel();
        throw new InvalidBody();
      }
      contents += decoder.decode(value, { stream: true });
    }
    contents += decoder.decode();
    const parsed = JSON.parse(contents || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new InvalidBody();
    return parsed;
  } catch {
    throw new InvalidBody();
  }
}

async function handle(request: Request, env: Env): Promise<Response> {
  const path = new URL(request.url).pathname;
  const method = request.method;
  if (path !== '/api' && !path.startsWith('/api/')) return env.ASSETS.fetch(request);

  const cfg = getServerSecurityConfig(env);
  const cookie = parseCookieHeader(request.headers.get('Cookie') ?? undefined)[SESSION_COOKIE_NAME];
  const session = cfg.accessVerificationConfigured
    ? verifySessionToken(cookie, cfg.sessionSecret, cfg.revokedIds)
    : null;

  if (path === '/api/public/config' && method === 'GET') {
    return json({
      priceTsh: 15000, originalPriceTsh: 30000, priceUsd: 7,
      checkoutConfigured: cfg.checkoutConfigured,
      checkoutUrl: cfg.selarCheckoutUrl,
      accessVerificationConfigured: cfg.accessVerificationConfigured,
    });
  }
  if (path === '/api/auth/session' && method === 'GET') {
    return json(session
      ? { authenticated: true, keyId: session.keyId, orderRef: session.ord }
      : { authenticated: false });
  }

  if (method === 'POST') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403);
  }
  if (path === '/api/fulfillment/issue' && method === 'POST') {
    const secret = env.ZAPIER_ISSUE_SECRET;
    if (!secret || secret.length < 32 || !cfg.accessVerificationConfigured || !cfg.accessKeySecret) {
      return json({ error: 'Purchase fulfillment is not configured.' }, 503);
    }
    const expected = createHash('sha256').update(`Bearer ${secret}`).digest();
    const supplied = createHash('sha256').update(request.headers.get('Authorization') ?? '').digest();
    if (!timingSafeEqual(expected, supplied)) return json({ error: 'Unauthorized.' }, 401);

    const body = await readBody(request);
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef.trim() : '';
    if (!orderRef || orderRef.length > 64) return json({ error: 'Invalid order reference.' }, 400);
    const { key } = issuePaidAccessKey({ secret: cfg.accessKeySecret, orderRef });
    return json({ accessCode: key, workspaceUrl: new URL(request.url).origin });
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    return json({ authenticated: false }, 200, { 'Set-Cookie': buildSessionCookieHeader('', true, true) });
  }
  if (path === '/api/auth/unlock' && method === 'POST') {
    if (!cfg.accessVerificationConfigured || !cfg.accessKeySecret || !cfg.sessionSecret) {
      return json({ error: 'Paid member verification is not configured on the server yet.' }, 503);
    }
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const limit = checkUnlockRateLimit(ip);
    if (!limit.allowed) {
      return json({ error: 'Too many attempts. Please try again later.' }, 429, {
        'Retry-After': String(limit.retryAfterSec ?? 60),
      });
    }
    const { accessKey } = await readBody(request);
    const result = verifyPaidAccessKey(typeof accessKey === 'string' ? accessKey : '', cfg.accessKeySecret, cfg.revokedIds);
    if (!result.ok) {
      recordUnlockFailure(ip);
      return json({ error: result.reason === 'revoked'
        ? 'This Paid Member Access Key has been revoked.'
        : 'Invalid Paid Member Access Key.' }, 401);
    }
    clearUnlockFailures(ip);
    const token = createSessionToken(result.payload, cfg.sessionSecret);
    return json({ authenticated: true, keyId: result.payload.id, orderRef: result.payload.ord }, 200, {
      'Set-Cookie': buildSessionCookieHeader(token, false, true),
    });
  }

  if (path === '/api/paid' || path.startsWith('/api/paid/')) {
    if (!session) return json({ error: 'Paid Member Access Key required.' }, 401);
    if (method === 'GET') {
      switch (path) {
        case '/api/paid/kit-data':
          return json({
            session: { keyId: session.keyId, orderRef: session.ord, expiresAt: session.exp },
            guideSteps: GUIDE_STEPS, conversationScripts: CONVERSATION_SCRIPTS,
            presellTemplates: PRESELL_TEMPLATES, workedExamples: WORKED_EXAMPLES,
            redFlags: RED_FLAGS, defaultWorkspaceState: DEFAULT_WORKSPACE_STATE,
          });
        case '/api/paid/examples':
          return json({ workedExamples: WORKED_EXAMPLES });
        case '/api/paid/scripts':
          return json({ conversationScripts: CONVERSATION_SCRIPTS, presellTemplates: PRESELL_TEMPLATES });
        case '/api/paid/bundle.js':
          return new Response(paidJs, { headers: { ...privateHeaders, 'Content-Type': 'application/javascript; charset=utf-8' } });
        case '/api/paid/bundle.css':
          return new Response(paidCss, { headers: { ...privateHeaders, 'Content-Type': 'text/css; charset=utf-8' } });
      }
    }
    if ((method === 'GET' || method === 'POST') && (path === '/api/paid/guide' || path === '/api/paid/zip')) {
      const state = method === 'POST' ? (await readBody(request)).workspaceState : undefined;
      if (path === '/api/paid/guide') {
        const html = buildGuideHtml(state == null ? DEFAULT_WORKSPACE_STATE : sanitizeWorkspaceState(state));
        return new Response(html, { headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
      }
      return new Response(Uint8Array.from(generateCustomerKitZipBuffer(state)), {
        headers: {
          ...privateHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="Biashara-Base-Validator-Kit.zip"',
        },
      });
    }
  }
  return json({ error: 'API endpoint not found.' }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (error) {
      if (error instanceof InvalidBody) return json({ error: 'Invalid or oversized request body.' }, 400);
      console.error('Validator Kit request failed');
      return json({ error: 'Unable to complete this request.' }, 500);
    }
  },
};
