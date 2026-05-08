const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Function to fix the keys
function fixKeys(text) {
    return text.replace(/(JWT_PRIVATE_KEY|JWT_PUBLIC_KEY)="([^"]+)"/g, (match, key, value) => {
        const cleanedValue = value.replace(/\\n/g, '\n');
        return `${key}="${cleanedValue}"`;
    });
}

const newContent = fixKeys(content);
fs.writeFileSync(envPath, newContent);
console.log('✅ .env file updated with literal newlines');
