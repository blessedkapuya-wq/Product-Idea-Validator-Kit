import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'bb_paid_session';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const PLACEHOLDER_PREFIXES = ['MY_', 'YOUR_', 'REPLACE_', 'CHANGE_ME', 'EXAMPLE_'];

export interface PaidKeyPayload {
  v: 1;
  id: string;
  iat: number;
  ord?: string;
  hint?: string;
}

export interface SessionPayload {
  v: 1;
  keyId: string;
  ord?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  paidSession?: SessionPayload;
}

export function isValidSecret(value: string | null | undefined): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 32) return false;
  const upper = trimmed.toUpperCase();
  return !PLACEHOLDER_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

export function getValidatedSelarCheckoutUrl(rawUrl: string | undefined): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (PLACEHOLDER_PREFIXES.some((prefix) => upper.startsWith(prefix))) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.toLowerCase();
    const isSelarHost =
      host === 'selar.co' ||
      host.endsWith('.selar.co') ||
      host === 'selar.com' ||
      host.endsWith('.selar.com');
    if (!isSelarHost) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function getServerSecurityConfig(env: {
  ACCESS_KEY_SECRET?: string;
  SESSION_SECRET?: string;
  SELAR_CHECKOUT_URL?: string;
  REVOKED_KEY_IDS?: string;
} = process.env) {
  const accessKeySecretRaw = env.ACCESS_KEY_SECRET;
  const sessionSecretRaw = env.SESSION_SECRET;
  const selarCheckoutUrl = getValidatedSelarCheckoutUrl(env.SELAR_CHECKOUT_URL);

  const accessKeyConfigured = isValidSecret(accessKeySecretRaw);
  const sessionConfigured = isValidSecret(sessionSecretRaw);

  const revokedIds = new Set(
    (env.REVOKED_KEY_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  return {
    accessKeySecret: accessKeyConfigured ? accessKeySecretRaw.trim() : null,
    sessionSecret: sessionConfigured ? sessionSecretRaw.trim() : null,
    accessVerificationConfigured: accessKeyConfigured && sessionConfigured,
    selarCheckoutUrl,
    checkoutConfigured: selarCheckoutUrl !== null,
    revokedIds,
  };
}

function hmacSignBase64Url(input: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(input, 'utf8').digest('base64url');
}

function timingSafeEqualBase64Url(aB64: string, bB64: string): boolean {
  try {
    const aBuf = Buffer.from(aB64, 'base64url');
    const bBuf = Buffer.from(bB64, 'base64url');
    if (aBuf.length !== 32 || bBuf.length !== 32) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export function issuePaidAccessKey(opts: {
  secret: string;
  orderRef?: string;
  buyerHint?: string;
}): { key: string; keyId: string; issuedAt: number } {
  if (!isValidSecret(opts.secret)) {
    throw new Error('ACCESS_KEY_SECRET must be at least 32 characters and not a placeholder.');
  }

  const keyId = `k_${crypto.randomBytes(8).toString('hex')}`;
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: PaidKeyPayload = {
    v: 1,
    id: keyId,
    iat: issuedAt,
    ...(opts.orderRef?.trim() ? { ord: opts.orderRef.trim().slice(0, 64) } : {}),
    ...(opts.buyerHint?.trim() ? { hint: opts.buyerHint.trim().slice(0, 64) } : {}),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = hmacSignBase64Url(`BB1.${payloadB64}`, opts.secret);
  return {
    key: `BB1.${payloadB64}.${sigB64}`,
    keyId,
    issuedAt,
  };
}

export type KeyVerificationResult =
  | { ok: true; payload: PaidKeyPayload }
  | { ok: false; reason: 'unconfigured' | 'invalid' | 'revoked' };

export function verifyPaidAccessKey(
  rawKey: string,
  secret: string | null,
  revokedIds: Set<string>
): KeyVerificationResult {
  if (!isValidSecret(secret)) {
    return { ok: false, reason: 'unconfigured' };
  }

  if (typeof rawKey !== 'string') {
    return { ok: false, reason: 'invalid' };
  }

  const trimmed = rawKey.trim();
  const match = /^BB1\.([A-Za-z0-9_-]{8,512})\.([A-Za-z0-9_-]{43})$/.exec(trimmed);
  if (!match) {
    return { ok: false, reason: 'invalid' };
  }

  const [, payloadB64, sigB64] = match;
  const expectedSigB64 = hmacSignBase64Url(`BB1.${payloadB64}`, secret);

  if (!timingSafeEqualBase64Url(sigB64, expectedSigB64)) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as Partial<PaidKeyPayload>;
    if (
      parsed.v !== 1 ||
      typeof parsed.id !== 'string' ||
      !parsed.id ||
      typeof parsed.iat !== 'number' ||
      !Number.isFinite(parsed.iat)
    ) {
      return { ok: false, reason: 'invalid' };
    }
    if (revokedIds.has(parsed.id)) {
      return { ok: false, reason: 'revoked' };
    }
    return {
      ok: true,
      payload: {
        v: 1,
        id: parsed.id,
        iat: parsed.iat,
        ...(typeof parsed.ord === 'string' ? { ord: parsed.ord } : {}),
        ...(typeof parsed.hint === 'string' ? { hint: parsed.hint } : {}),
      },
    };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

export function createSessionToken(payload: PaidKeyPayload, sessionSecret: string): string {
  if (!isValidSecret(sessionSecret)) {
    throw new Error('SESSION_SECRET must be configured.');
  }
  const now = Math.floor(Date.now() / 1000);
  const session: SessionPayload = {
    v: 1,
    keyId: payload.id,
    ...(payload.ord ? { ord: payload.ord } : {}),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const bodyB64 = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const sigB64 = hmacSignBase64Url(`BBS1.${bodyB64}`, sessionSecret);
  return `BBS1.${bodyB64}.${sigB64}`;
}

export function verifySessionToken(
  token: string | undefined,
  sessionSecret: string | null,
  revokedIds: Set<string>
): SessionPayload | null {
  if (!token || !isValidSecret(sessionSecret)) {
    return null;
  }
  const match = /^BBS1\.([A-Za-z0-9_-]{8,512})\.([A-Za-z0-9_-]{43})$/.exec(token.trim());
  if (!match) {
    return null;
  }
  const [, bodyB64, sigB64] = match;
  const expectedSigB64 = hmacSignBase64Url(`BBS1.${bodyB64}`, sessionSecret);
  if (!timingSafeEqualBase64Url(sigB64, expectedSigB64)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      parsed.v !== 1 ||
      typeof parsed.keyId !== 'string' ||
      !parsed.keyId ||
      typeof parsed.iat !== 'number' ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= now ||
      revokedIds.has(parsed.keyId)
    ) {
      return null;
    }
    return {
      v: 1,
      keyId: parsed.keyId,
      ...(typeof parsed.ord === 'string' ? { ord: parsed.ord } : {}),
      iat: parsed.iat,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx <= 0) continue;
    const name = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (name) {
      try {
        out[name] = decodeURIComponent(val);
      } catch {
        out[name] = val;
      }
    }
  }
  return out;
}

export function getSessionFromRequest(req: Request): SessionPayload | null {
  const cfg = getServerSecurityConfig();
  if (!cfg.accessVerificationConfigured || !cfg.sessionSecret) {
    return null;
  }
  const cookies = parseCookieHeader(req.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME], cfg.sessionSecret, cfg.revokedIds);
}

export function requirePaidAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const cfg = getServerSecurityConfig();
  res.setHeader('Cache-Control', 'no-store, private');

  if (!cfg.accessVerificationConfigured) {
    res.status(401).json({
      error: 'Paid access required. Server key verification is not configured.',
    });
    return;
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({
      error: 'Paid Member Access Key required. Please sign in with your paid key.',
    });
    return;
  }

  req.paidSession = session;
  next();
}

export function buildSessionCookieHeader(token: string, clear = false, secure = process.env.ALLOW_INSECURE_LOCAL_COOKIE !== 'true'): string {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${clear ? 0 : SESSION_TTL_SECONDS}`,
  ];
  if (secure) {
    attrs.push('Secure');
  }
  return attrs.join('; ');
}

// In-memory rate limiter for unlock attempts per IP
const unlockAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_FAILURES = 20;

export function checkUnlockRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = unlockAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    return { allowed: true };
  }
  if (entry.count >= RATE_MAX_FAILURES) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function recordUnlockFailure(ip: string): void {
  const now = Date.now();
  const entry = unlockAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    unlockAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearUnlockFailures(ip: string): void {
  unlockAttempts.delete(ip);
}
