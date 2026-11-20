import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

execSync('npm run build', { stdio: 'inherit' });

const paidBundle = new URL('../dist/private/paid-assets/', import.meta.url);
const paidJs = readFileSync(new URL('paid-kit.js', paidBundle), 'utf8');
const paidCss = readFileSync(new URL('paid-kit.css', paidBundle), 'utf8');
writeFileSync(new URL('../dist/private/worker-assets.mjs', import.meta.url),
  `export const paidJs = ${JSON.stringify(paidJs)};\nexport const paidCss = ${JSON.stringify(paidCss)};\n`);
