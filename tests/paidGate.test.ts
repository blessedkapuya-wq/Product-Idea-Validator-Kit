import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../server';
import { getValidatedSelarCheckoutUrl, issuePaidAccessKey } from '../server/auth';

const ROOT_DIR = process.cwd();
const PUBLIC_DIST_DIR = path.resolve(ROOT_DIR, 'dist/public');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

describe('Biashara Base Paid-Access Gate Integration Tests', () => {
  let server: http.Server;
  let baseUrl = '';

  const savedEnv = {
    ACCESS_KEY_SECRET: process.env.ACCESS_KEY_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SELAR_CHECKOUT_URL: process.env.SELAR_CHECKOUT_URL,
    REVOKED_KEY_IDS: process.env.REVOKED_KEY_IDS,
  };

  const testAccessSecret = crypto.randomBytes(32).toString('hex');
  const testSessionSecret = crypto.randomBytes(32).toString('hex');

  before(async () => {
    const app = await createApp({ isProd: true });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    assert.ok(addr && typeof addr !== 'string');
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    process.env.ACCESS_KEY_SECRET = savedEnv.ACCESS_KEY_SECRET;
    process.env.SESSION_SECRET = savedEnv.SESSION_SECRET;
    process.env.SELAR_CHECKOUT_URL = savedEnv.SELAR_CHECKOUT_URL;
    process.env.REVOKED_KEY_IDS = savedEnv.REVOKED_KEY_IDS;

    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('keeps public/ empty and excludes paid content, ZIPs, PDFs, and secrets from dist/public', () => {
    const publicFiles = walkFiles(PUBLIC_DIR);
    assert.equal(publicFiles.length, 0, 'public/ static folder must be empty');

    const distPublicFiles = walkFiles(PUBLIC_DIST_DIR);
    assert.ok(distPublicFiles.length > 0, 'dist/public must be built before running tests');

    for (const file of distPublicFiles) {
      const lower = file.toLowerCase();
      assert.ok(!lower.endsWith('.zip'), `No .zip allowed in dist/public: ${file}`);
      assert.ok(!lower.endsWith('.pdf'), `No .pdf allowed in dist/public: ${file}`);

      if (lower.endsWith('.js') || lower.endsWith('.html') || lower.endsWith('.css')) {
        const text = fs.readFileSync(file, 'utf8');
        const forbiddenMarkers = [
          'CONVERSATION_SCRIPTS',
          'Unapoandaa Reels zako za kazi',
          'Faceless Creator Pivot',
          'Canva Media Kit & Brand Rate Card Starter',
          'biashara-base-validator-kit-source.zip',
          'StatusSlideGenerator',
          'PriceSanityCalculator',
          'ACCESS_KEY_SECRET',
          'SESSION_SECRET',
        ];
        for (const marker of forbiddenMarkers) {
          assert.ok(
            !text.includes(marker),
            `Public build leaked restricted marker "${marker}" in ${path.basename(file)}`
          );
        }
      }
    }
  });

  it('fails closed when server secrets and Selar URL are absent, and ignores redirect params', async () => {
    delete process.env.ACCESS_KEY_SECRET;
    delete process.env.SESSION_SECRET;
    delete process.env.SELAR_CHECKOUT_URL;
    delete process.env.REVOKED_KEY_IDS;

    const homeRes = await fetch(`${baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const html = await homeRes.text();
    assert.ok(html.includes('Product Idea Validator Kit'));

    // Simulated purchase redirect must never unlock anything
    const redirectRes = await fetch(`${baseUrl}/?selar_paid=1&unlocked=true&paid=1`);
    assert.equal(redirectRes.status, 200);

    const cfgRes = await fetch(`${baseUrl}/api/public/config`);
    assert.equal(cfgRes.status, 200);
    const cfg = (await cfgRes.json()) as {
      checkoutConfigured: boolean;
      checkoutUrl: string | null;
      accessVerificationConfigured: boolean;
      priceTsh: number;
      priceUsd: number;
    };
    assert.equal(cfg.checkoutConfigured, false);
    assert.equal(cfg.checkoutUrl, null);
    assert.equal(cfg.accessVerificationConfigured, false);
    assert.equal(cfg.priceTsh, 15000);
    assert.equal(cfg.priceUsd, 7);

    const sessionRes = await fetch(`${baseUrl}/api/auth/session`);
    assert.equal(sessionRes.status, 200);
    const sessionJson = (await sessionRes.json()) as { authenticated: boolean };
    assert.equal(sessionJson.authenticated, false);

    const unlockRes = await fetch(`${baseUrl}/api/auth/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey: 'BB1.fake.key' }),
    });
    assert.equal(unlockRes.status, 503);

    const paidRes = await fetch(`${baseUrl}/api/paid/kit-data`);
    assert.equal(paidRes.status, 401);
  });

  it('validates Selar URLs strictly and rejects invalid, tampered, and revoked access keys', async () => {
    assert.equal(getValidatedSelarCheckoutUrl('http://selar.co/kit'), null);
    assert.equal(getValidatedSelarCheckoutUrl('https://evil.example.com/selar'), null);
    assert.equal(getValidatedSelarCheckoutUrl('YOUR_SELAR_URL'), null);
    assert.equal(
      getValidatedSelarCheckoutUrl('https://selar.co/validator-kit'),
      'https://selar.co/validator-kit'
    );

    process.env.ACCESS_KEY_SECRET = testAccessSecret;
    process.env.SESSION_SECRET = testSessionSecret;
    process.env.SELAR_CHECKOUT_URL = 'https://selar.co/validator-kit';
    process.env.REVOKED_KEY_IDS = '';

    const cfgRes = await fetch(`${baseUrl}/api/public/config`);
    const cfg = (await cfgRes.json()) as {
      checkoutConfigured: boolean;
      checkoutUrl: string | null;
      accessVerificationConfigured: boolean;
    };
    assert.equal(cfg.checkoutConfigured, true);
    assert.equal(cfg.checkoutUrl, 'https://selar.co/validator-kit');
    assert.equal(cfg.accessVerificationConfigured, true);

    // Malformed / wrong keys
    for (const badKey of ['', 'not-a-key', 'BB1.invalidpayload.invalidsig']) {
      const res = await fetch(`${baseUrl}/api/auth/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: badKey }),
      });
      assert.equal(res.status, 401);
      assert.equal(res.headers.get('set-cookie'), null);
    }

    // Tampered payload
    const valid = issuePaidAccessKey({
      secret: testAccessSecret,
      orderRef: 'SELAR-TEST-01',
    });
    const parts = valid.key.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ v: 1, id: 'k_tampered', iat: 1700000000 }),
      'utf8'
    ).toString('base64url');
    const tamperedKey = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const tamperedRes = await fetch(`${baseUrl}/api/auth/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey: tamperedKey }),
    });
    assert.equal(tamperedRes.status, 401);

    // Revoked key
    process.env.REVOKED_KEY_IDS = valid.keyId;
    const revokedRes = await fetch(`${baseUrl}/api/auth/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey: valid.key }),
    });
    assert.equal(revokedRes.status, 401);
    process.env.REVOKED_KEY_IDS = '';
  });

  it('blocks all unauthenticated paid APIs, guessed URLs, direct asset paths, and source archives', async () => {
    process.env.ACCESS_KEY_SECRET = testAccessSecret;
    process.env.SESSION_SECRET = testSessionSecret;

    const blockedPaths = [
      '/api/paid/kit-data',
      '/api/paid/examples',
      '/api/paid/scripts',
      '/api/paid/guide',
      '/api/paid/zip',
      '/api/paid/bundle.js',
      '/api/paid/bundle.css',
      '/biashara-base-validator-kit-source.zip',
      '/Biashara-Base-Validator-Kit.zip',
      '/downloads/Biashara-Base-Validator-Kit.zip',
      '/paid/guide.html',
      '/paid-assets/paid-kit.js',
      '/assets/aistudio/Product-Idea-Validator-Kit_Blueprint_6512ef64.pdf',
      '/assets/aistudio/image_934b5651.png',
      '/private/assets/aistudio/Product-Idea-Validator-Kit_Blueprint_6512ef64.pdf',
      '/src/paid/PaidApp.tsx',
      '/server/paidData.ts',
      '/.env',
      '/package.json',
      '/paid/../private/assets/aistudio/Product-Idea-Validator-Kit_Blueprint_6512ef64.pdf',
    ];

    for (const p of blockedPaths) {
      const res = await fetch(`${baseUrl}${p}`);
      assert.ok(
        res.status === 401 || res.status === 404,
        `Expected 401 or 404 for unauthenticated ${p}, got ${res.status}`
      );
    }

    const postZipUnauth = await fetch(`${baseUrl}/api/paid/zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(postZipUnauth.status, 401);
  });

  it('issues HttpOnly Secure SameSite session cookie on valid key, serves paid APIs & ZIP, and locks on logout', async () => {
    process.env.ACCESS_KEY_SECRET = testAccessSecret;
    process.env.SESSION_SECRET = testSessionSecret;
    process.env.SELAR_CHECKOUT_URL = 'https://selar.co/validator-kit';
    process.env.REVOKED_KEY_IDS = '';

    const issued = issuePaidAccessKey({
      secret: testAccessSecret,
      orderRef: 'SELAR-ORDER-9001',
    });

    const unlockRes = await fetch(`${baseUrl}/api/auth/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey: issued.key }),
    });
    assert.equal(unlockRes.status, 200);
    const unlockJson = (await unlockRes.json()) as {
      authenticated: boolean;
      keyId: string;
      orderRef?: string;
    };
    assert.equal(unlockJson.authenticated, true);
    assert.equal(unlockJson.keyId, issued.keyId);
    assert.equal(unlockJson.orderRef, 'SELAR-ORDER-9001');

    const setCookie = unlockRes.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('bb_paid_session='), 'Must set bb_paid_session cookie');
    assert.ok(setCookie.includes('HttpOnly'), 'Session cookie must be HttpOnly');
    assert.ok(setCookie.includes('SameSite=Lax'), 'Session cookie must specify SameSite=Lax');
    assert.ok(setCookie.includes('Secure'), 'Session cookie must specify Secure');

    const cookiePair = setCookie.split(';')[0];
    const authHeaders = { Cookie: cookiePair };

    // Authenticated session check
    const sessRes = await fetch(`${baseUrl}/api/auth/session`, { headers: authHeaders });
    assert.equal(sessRes.status, 200);
    const sessJson = (await sessRes.json()) as { authenticated: boolean; orderRef?: string };
    assert.equal(sessJson.authenticated, true);
    assert.equal(sessJson.orderRef, 'SELAR-ORDER-9001');

    // Protected kit data
    const kitRes = await fetch(`${baseUrl}/api/paid/kit-data`, { headers: authHeaders });
    assert.equal(kitRes.status, 200);
    const kitData = (await kitRes.json()) as {
      guideSteps: unknown[];
      conversationScripts: unknown[];
      workedExamples: unknown[];
      redFlags: unknown[];
    };
    assert.equal(kitData.guideSteps.length, 6);
    assert.equal(kitData.conversationScripts.length, 5);
    assert.equal(kitData.workedExamples.length, 3);
    assert.equal(kitData.redFlags.length, 10);

    // Protected examples, scripts, guide, and bundle assets
    const examplesRes = await fetch(`${baseUrl}/api/paid/examples`, { headers: authHeaders });
    assert.equal(examplesRes.status, 200);

    const scriptsRes = await fetch(`${baseUrl}/api/paid/scripts`, { headers: authHeaders });
    assert.equal(scriptsRes.status, 200);

    const guideRes = await fetch(`${baseUrl}/api/paid/guide`, { headers: authHeaders });
    assert.equal(guideRes.status, 200);
    const guideHtml = await guideRes.text();
    assert.ok(guideHtml.includes('Product Idea') && guideHtml.includes('Validator Kit'));

    const bundleJsRes = await fetch(`${baseUrl}/api/paid/bundle.js`, { headers: authHeaders });
    assert.equal(bundleJsRes.status, 200);
    const bundleJs = await bundleJsRes.text();
    assert.ok(bundleJs.includes('__BIASHARA_MOUNT_PAID_KIT__'));

    const bundleCssRes = await fetch(`${baseUrl}/api/paid/bundle.css`, { headers: authHeaders });
    assert.equal(bundleCssRes.status, 200);

    // Exact customer ZIP download
    const zipRes = await fetch(`${baseUrl}/api/paid/zip`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceState: {
          scriptVariables: {
            topic: 'Creator Reels Template Pack',
            audience: 'Tanzania digital creators',
            priceTsh: 'TSh 15,000',
            priceUsd: '$7',
          },
        },
      }),
    });
    assert.equal(zipRes.status, 200);
    assert.equal(zipRes.headers.get('content-type'), 'application/zip');
    const zipBuf = Buffer.from(await zipRes.arrayBuffer());
    assert.equal(zipBuf.subarray(0, 4).toString('binary'), 'PK\x03\x04');

    const zipText = zipBuf.toString('utf8');
    for (const expectedFile of [
      '01-Product-Idea-Validator-Guide.html',
      '02-Idea-Scoring-Sheet.csv',
      '03-Swahili-English-Scripts.txt',
      '04-Is-My-Idea-Sellable-Checklist.html',
      '05-Worked-Examples-And-Red-Flags.txt',
      '06-My-Validated-Offer-Draft.txt',
    ]) {
      assert.ok(zipText.includes(expectedFile), `ZIP missing expected entry ${expectedFile}`);
    }

    // Logout clears cookie and revokes further ZIP downloads with empty cookie
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: authHeaders,
    });
    assert.equal(logoutRes.status, 200);
    const clearCookieHeader = logoutRes.headers.get('set-cookie') || '';
    assert.ok(clearCookieHeader.includes('Max-Age=0'));

    const postLogoutZip = await fetch(`${baseUrl}/api/paid/zip`);
    assert.equal(postLogoutZip.status, 401);
  });
});
