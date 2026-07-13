const { Sequelize } = require('sequelize');
const s = new Sequelize('postgresql://neondb_owner:npg_bOAcCXIWdJ03@ep-soft-poetry-ag3xcu5l-pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require', {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});
s.query("SELECT delivery_otp FROM commandes WHERE id LIKE '3ba907c3%'")
    .then(console.log)
    .catch(console.error)
    .finally(() => s.close());
