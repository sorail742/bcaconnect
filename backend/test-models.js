require('dotenv').config();
const axios = require('axios');

axios.get('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
}).then(res => {
    const models = res.data.data.map(m => m.id);
    console.log("All models:", models);
}).catch(err => console.error(err.message));
