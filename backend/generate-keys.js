const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');

content = content.replace(/JWT_PRIVATE_KEY="[^]*?"/m, `JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);
content = content.replace(/JWT_PUBLIC_KEY="[^]*?"/m, `JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`);

fs.writeFileSync(envPath, content);
console.log('✅ Fresh RSA keys generated and injected into .env');
