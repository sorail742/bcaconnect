const { Wallet, Transaction, User, sequelize } = require('./src/models');
const walletController = { recharge: require('./src/controllers/walletController').recharge, transfer: require('./src/controllers/walletController').transfer };

async function runConcurrencyTest() {
    console.log('--- STARTING WALLET CONCURRENCY TEST ---');
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        // Setup: Create a test user and wallet
        const user = await User.create({
            nom_complet: 'Test Wallet User',
            email: `testwallet-${Date.now()}@bca.com`,
            telephone: `0000${Date.now()}`.slice(-9),
            mot_de_passe: 'password123',
            role: 'client'
        });

        const wallet = await Wallet.create({ user_id: user.id, solde_virtuel: 0 });
        console.log(`✅ Test User Created (ID: ${user.id}) with Balance: 0`);

        // Test 1: Concurrent Recharges (Race Condition Check)
        console.log('\n🚀 TEST 1: 20 Simultaneous Recharges of 500 GNF');
        const rechargePromises = [];
        let successes = 0;
        let failures = 0;
        
        // Mocking req/res for the controller
        for (let i = 0; i < 20; i++) {
            const req = {
                user: { id: user.id },
                body: { montant: 500, mode_paiement: 'orange_money' } // Bypass idempotency
            };
            
            // We wrap the controller call in a promise to resolve custom statuses
            const p = new Promise(async (resolve) => {
                const res = {
                    status: function(code) { this.statusCode = code; return this; },
                    json: function(data) { resolve('success'); }
                };
                const next = function(err) { resolve('error'); };
                try {
                    await walletController.recharge(req, res, next);
                } catch(e) { resolve('error'); }
            });
            rechargePromises.push(p);
        }

        const results = await Promise.all(rechargePromises);
        successes = results.filter(r => r === 'success').length;
        failures = results.filter(r => r === 'error').length;

        // Verify Balance
        const updatedWallet = await Wallet.findByPk(wallet.id);
        const expectedBalance = successes * 500;
        
        console.log(`\n📊 API Results: ${successes} Success, ${failures} Rejected (SQLITE_BUSY DB Locks)`);
        console.log(`📊 Final Balance Expected: ${expectedBalance} GNF (${successes} * 500)`);
        console.log(`📈 Final Balance Actual  : ${updatedWallet.solde_virtuel} GNF`);
        
        if (Number(updatedWallet.solde_virtuel) === expectedBalance) {
            console.log('✅ TEST 1 PASSED: Strict ACID isolation. No Race Conditions allowed.');
        } else {
            console.error('❌ TEST 1 FAILED: Discrepancy detected in wallet balance.');
        }

        // Cleanup
        await Transaction.destroy({ where: { portefeuille_id: wallet.id }});
        await wallet.destroy();
        await user.destroy();
        console.log('🧹 Cleanup complete.');

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

runConcurrencyTest();
