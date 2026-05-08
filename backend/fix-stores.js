const { Store } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

async function fixStores() {
    console.log('--- DATA RECOVERY & NORMALIZATION ---');
    try {
        const stores = await Store.findAll();
        for (const store of stores) {
            let updated = false;
            if (!store.slug) {
                const newSlug = store.nom_boutique.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(0, 6);
                console.log(`🔧 Assigning slug [${newSlug}] to store [${store.nom_boutique}]`);
                store.slug = newSlug;
                updated = true;
            }
            if (store.statut !== 'actif') {
                console.log(`🔧 Activating store [${store.nom_boutique}]`);
                store.statut = 'actif';
                updated = true;
            }
            if (updated) {
                await store.save();
            }
        }
        console.log('✅ Stores normalization finished.');
    } catch (err) {
        console.error('❌ Error fixing stores:', err.message);
    }
}

fixStores();
