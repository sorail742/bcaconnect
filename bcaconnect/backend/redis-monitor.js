#!/usr/bin/env node
/**
 * Redis Monitoring Utility
 * Monitor refresh token storage and security incidents in Redis
 */

const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function monitorRedis() {
    const client = redis.createClient({ url: REDIS_URL });
    
    client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        process.exit(1);
    });
    
    await client.connect();
    console.log('✅ Connected to Redis');
    
    try {
        // Get all refresh token keys
        const rtKeys = await client.keys('rt:*');
        console.log('\n📋 Refresh Tokens in Redis:');
        console.log('─'.repeat(60));
        
        if (rtKeys.length === 0) {
            console.log('   (No tokens stored)');
        } else {
            for (const key of rtKeys) {
                const hash = await client.get(key);
                const ttl = await client.ttl(key);
                const expiresIn = ttl > 0 ? `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m` : 'Expired';
                
                console.log(`   ${key}`);
                console.log(`   ├─ Hash: ${hash?.substring(0, 32)}...`);
                console.log(`   └─ Expires: ${expiresIn}`);
            }
        }
        
        // Get all security incident keys
        const secKeys = await client.keys('security:*');
        console.log('\n🚨 Security Incidents:');
        console.log('─'.repeat(60));
        
        if (secKeys.length === 0) {
            console.log('   (No incidents recorded)');
        } else {
            for (const key of secKeys) {
                const timestamp = await client.get(key);
                const ttl = await client.ttl(key);
                const expiresIn = ttl > 0 ? `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m` : 'Expired';
                
                console.log(`   ${key}`);
                console.log(`   ├─ Timestamp: ${timestamp}`);
                console.log(`   └─ Expires: ${expiresIn}`);
            }
        }
        
        // Get Redis stats
        const info = await client.info('stats');
        console.log('\n📊 Redis Statistics:');
        console.log('─'.repeat(60));
        console.log(info);
        
        // Get memory usage
        const memInfo = await client.info('memory');
        console.log('\n💾 Memory Usage:');
        console.log('─'.repeat(60));
        console.log(memInfo);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.quit();
        console.log('\n✅ Disconnected from Redis');
    }
}

// Watch mode - monitor in real-time
async function watchRedis(interval = 5000) {
    console.log('🔍 Redis Monitoring (Watch Mode)');
    console.log(`Refreshing every ${interval / 1000} seconds...`);
    console.log('Press Ctrl+C to exit\n');
    
    const client = redis.createClient({ url: REDIS_URL });
    
    client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        process.exit(1);
    });
    
    await client.connect();
    
    const displayStats = async () => {
        console.clear();
        console.log('🔍 Redis Monitoring (Watch Mode)');
        console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
        console.log('─'.repeat(60));
        
        try {
            const rtKeys = await client.keys('rt:*');
            const secKeys = await client.keys('security:*');
            
            console.log(`\n📋 Active Refresh Tokens: ${rtKeys.length}`);
            for (const key of rtKeys.slice(0, 5)) {
                const ttl = await client.ttl(key);
                console.log(`   ${key} (TTL: ${ttl}s)`);
            }
            if (rtKeys.length > 5) {
                console.log(`   ... and ${rtKeys.length - 5} more`);
            }
            
            console.log(`\n🚨 Security Incidents: ${secKeys.length}`);
            for (const key of secKeys.slice(0, 5)) {
                console.log(`   ${key}`);
            }
            if (secKeys.length > 5) {
                console.log(`   ... and ${secKeys.length - 5} more`);
            }
            
            console.log('\n─'.repeat(60));
            console.log('Press Ctrl+C to exit');
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    };
    
    // Initial display
    await displayStats();
    
    // Refresh every interval
    setInterval(displayStats, interval);
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'monitor';

if (command === 'watch') {
    const interval = parseInt(args[1]) || 5000;
    watchRedis(interval).catch(console.error);
} else if (command === 'monitor') {
    monitorRedis().catch(console.error);
} else if (command === 'clear') {
    // Clear all tokens and incidents
    (async () => {
        const client = redis.createClient({ url: REDIS_URL });
        await client.connect();
        
        const rtKeys = await client.keys('rt:*');
        const secKeys = await client.keys('security:*');
        
        if (rtKeys.length > 0) {
            await client.del(rtKeys);
            console.log(`✅ Deleted ${rtKeys.length} refresh tokens`);
        }
        
        if (secKeys.length > 0) {
            await client.del(secKeys);
            console.log(`✅ Deleted ${secKeys.length} security incidents`);
        }
        
        await client.quit();
    })().catch(console.error);
} else {
    console.log('Usage:');
    console.log('  node redis-monitor.js monitor          - Show current state');
    console.log('  node redis-monitor.js watch [interval] - Watch in real-time (default 5000ms)');
    console.log('  node redis-monitor.js clear            - Clear all tokens and incidents');
}
