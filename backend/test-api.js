#!/usr/bin/env node
/**
 * Test Script: API Functional Tests
 * Verifies that the main API endpoints are responsive
 */

const axios = require('axios');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Disable SSL verification for self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const client = axios.create({
    baseURL: API_URL,
    httpsAgent,
    validateStatus: () => true // Don't throw on any status
});

async function runTests() {
    console.log('\n🚀 Starting API Functional Tests');
    console.log('═'.repeat(50));
    console.log(`API URL: ${API_URL}\n`);

    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.error(`❌ ${name}`);
            console.error(`   Error: ${error.message}`);
            failed++;
        }
    };

    // 1. Health Check
    await test('GET /health', async () => {
        const res = await client.get('/health');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (res.data.status.toLowerCase() !== 'ok') throw new Error('Status not ok');
    });

    // 2. Ping Check
    await test('GET /ping', async () => {
        const res = await client.get('/ping');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // 3. Products Public List
    await test('GET /products', async () => {
        const res = await client.get('/products');
        if (res.status !== 200 && res.status !== 404) throw new Error(`Status ${res.status}`);
    });

    // 4. Categories Public List
    await test('GET /categories', async () => {
        const res = await client.get('/categories');
        if (res.status !== 200 && res.status !== 404) throw new Error(`Status ${res.status}`);
    });

    // 5. Auth Me (should fail with 401)
    await test('GET /auth/me (unauthenticated)', async () => {
        const res = await client.get('/auth/me');
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    });

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Summary: ${passed} passed, ${failed} failed`);
    console.log('═'.repeat(50) + '\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
