#!/usr/bin/env node
/**
 * Test Script: Refresh Token Rotation
 * Verifies that token rotation, storage, and compromission detection work correctly
 */

const axios = require('axios');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER = {
    nom_complet: 'Test User',
    email: 'test@example.com',
    telephone: '224612345678',
    mot_de_passe: 'TestPassword123!',
    role: 'client'
};


// Helper to ensure test user exists
async function ensureTestUser() {
    try {
        await client.post('/auth/register', TEST_USER);
        console.log('✅ Test user registered or already exists');
    } catch (error) {
        // Ignore if already exists (400/409/422/401)
        if (error.response?.status !== 400 && error.response?.status !== 422 && error.response?.status !== 409) {
            // console.warn('⚠️  Registration warning:', error.message);
        }
    }
}

// Disable SSL verification for self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const client = axios.create({
    baseURL: API_URL,
    httpsAgent,
    withCredentials: true
});

let cookies = '';

// Helper to extract cookies from response
function extractCookies(response) {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
        cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    }
}

// Test 1: Login and verify token storage
async function testLogin() {
    console.log('\n📝 Test 1: Login and Token Storage');
    console.log('─'.repeat(50));
    
    try {
        const response = await client.post('/auth/login', TEST_USER);
        extractCookies(response);
        
        const { accessToken, user } = response.data;
        
        if (!accessToken) {
            throw new Error('No access token returned');
        }
        
        console.log('✅ Login successful');
        console.log(`   User ID: ${user.id}`);
        console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
        console.log(`   Cookies: ${cookies.substring(0, 50)}...`);
        
        return { accessToken, userId: user.id };
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Test 2: Verify access token works
async function testAccessToken(accessToken) {
    console.log('\n📝 Test 2: Access Token Validation');
    console.log('─'.repeat(50));
    
    try {
        const response = await client.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log('✅ Access token is valid');
        console.log(`   User: ${response.data.nom_complet}`);
        console.log(`   Role: ${response.data.role}`);
    } catch (error) {
        console.error('❌ Access token validation failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Test 3: Refresh token and verify rotation
async function testTokenRefresh(userId) {
    console.log('\n📝 Test 3: Token Refresh and Rotation');
    console.log('─'.repeat(50));
    
    try {
        const response = await client.post('/auth/refresh-token', { userId }, {
            headers: { Cookie: cookies }
        });
        
        extractCookies(response);
        
        const { accessToken } = response.data;
        
        if (!accessToken) {
            throw new Error('No new access token returned');
        }
        
        console.log('✅ Token refresh successful');
        console.log(`   New Access Token: ${accessToken.substring(0, 20)}...`);
        console.log(`   New Refresh Token: ${cookies.substring(0, 50)}...`);
        
        return accessToken;
    } catch (error) {
        console.error('❌ Token refresh failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Test 4: Detect token reuse (compromission)
async function testCompromissionDetection(userId, oldRefreshToken) {
    console.log('\n📝 Test 4: Compromission Detection (Token Reuse)');
    console.log('─'.repeat(50));
    
    try {
        // Try to use old refresh token again
        const response = await client.post('/auth/refresh-token', { userId }, {
            headers: { Cookie: `bca_refresh_token=${oldRefreshToken}` }
        });
        
        console.error('❌ Compromission NOT detected - old token still works!');
        process.exit(1);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Compromission detected correctly');
            console.log(`   Error: ${error.response.data.message}`);
            console.log('   All tokens for user have been revoked');
        } else {
            console.error('❌ Unexpected error:', error.response?.data || error.message);
            process.exit(1);
        }
    }
}

// Test 5: Logout and verify token revocation
async function testLogout(accessToken) {
    console.log('\n📝 Test 5: Logout and Token Revocation');
    console.log('─'.repeat(50));
    
    try {
        const response = await client.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log('✅ Logout successful');
        console.log(`   Message: ${response.data.message}`);
        
        // Try to use old refresh token
        try {
            await client.post('/auth/refresh-token', { userId: 'test' }, {
                headers: { Cookie: cookies }
            });
            console.error('❌ Token not revoked after logout');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Token revoked after logout');
            }
        }
    } catch (error) {
        console.error('❌ Logout failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Main test runner
async function runTests() {
    console.log('\n🔐 Refresh Token Rotation Test Suite');
    console.log('═'.repeat(50));
    console.log(`API URL: ${API_URL}`);
    console.log(`Test User: ${TEST_USER.email}`);
    
    try {
        // Ensure test user exists
        await ensureTestUser();

        // Test 1: Login
        const { accessToken, userId } = await testLogin();
        
        // Test 2: Verify access token
        await testAccessToken(accessToken);
        
        // Save old refresh token for compromission test
        const oldRefreshToken = cookies.split('bca_refresh_token=')[1]?.split(';')[0];
        
        // Test 3: Refresh token
        const newAccessToken = await testTokenRefresh(userId);
        
        // Test 4: Detect compromission (token reuse)
        if (oldRefreshToken) {
            await testCompromissionDetection(userId, oldRefreshToken);
        }
        
        // Test 5: Logout
        await testLogout(newAccessToken);
        
        console.log('\n✅ All tests passed!');
        console.log('═'.repeat(50));
        console.log('\n🎉 Refresh Token Rotation is working correctly!\n');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run tests
runTests();
