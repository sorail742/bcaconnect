require('dotenv').config();
const jwt = require('jsonwebtoken');

function cleanKey(key) {
    if (!key) return null;
    return key.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const pk = cleanKey(process.env.JWT_PRIVATE_KEY);
const pub = cleanKey(process.env.JWT_PUBLIC_KEY);

try {
    const t = jwt.sign({id:1}, pk, {algorithm:'RS256'});
    console.log('✅ Token signed successfully');
    const d = jwt.verify(t, pub, {algorithms:['RS256']});
    console.log('✅ Token verified successfully');
} catch(e) {
    console.error('❌ Error:', e.message);
}
