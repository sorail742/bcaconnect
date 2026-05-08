const { Store } = require('./src/models');
const { Op } = require('sequelize');

async function debug() {
    const slug = '1c0c62b7-9514-4656-98eb-d85843e01faa';
    console.log(`Searching for store with slug or id: ${slug}`);
    try {
        const store = await Store.findOne({
            where: {
                [Op.or]: [
                    { id: slug },
                    { slug: slug }
                ]
            }
        });
        if (store) {
            console.log('✅ Found store:');
            console.log(JSON.stringify(store.toJSON(), null, 2));
        } else {
            console.log('❌ Store NOT found.');
        }
    } catch (err) {
        console.error('❌ Error searching store:', err.message);
    }
}

debug();
