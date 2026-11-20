import 'dotenv/config';
import { isValidSecret, issuePaidAccessKey } from './auth';

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return undefined;
}

const secret = process.env.ACCESS_KEY_SECRET;
if (!isValidSecret(secret)) {
  console.error(
    'ERROR: ACCESS_KEY_SECRET must be set (>= 32 random chars, non-placeholder) before issuing Paid Member Access Keys.'
  );
  process.exit(1);
}

const orderRef = parseArg('--order') || parseArg('-o');
const buyerHint = parseArg('--hint') || parseArg('-h');

if (!orderRef) {
  console.error(
    'Usage: npm run issue-key -- --order <SELAR_ORDER_ID> [--hint <masked_buyer_ref>]'
  );
  process.exit(1);
}

const issued = issuePaidAccessKey({
  secret,
  orderRef,
  buyerHint,
});

console.log('Issued Paid Member Access Key');
console.log('----------------------------');
console.log(`Key ID   : ${issued.keyId}`);
console.log(`Order    : ${orderRef}`);
console.log(`Issued   : ${new Date(issued.issuedAt * 1000).toISOString()}`);
console.log(`AccessKey: ${issued.key}`);
