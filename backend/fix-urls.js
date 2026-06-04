const { sequelize } = require('./src/models');

async function fix() {
    try {
        console.log("Starting update...");
        await sequelize.query(`UPDATE "produits" SET image_url = REPLACE(image_url, 'http://localhost:5000/', 'http://localhost:5001/') WHERE image_url LIKE '%localhost:5000%';`);
        await sequelize.query(`UPDATE "publicites" SET url_image = REPLACE(url_image, 'http://localhost:5000/', 'http://localhost:5001/') WHERE url_image LIKE '%localhost:5000%';`);
        await sequelize.query(`UPDATE "litiges" SET preuves = REPLACE(preuves, 'http://localhost:5000/', 'http://localhost:5001/') WHERE preuves LIKE '%localhost:5000%';`);
        console.log("DB Updated Successfully!");
    } catch (e) {
        console.error("Error updating:", e);
    } finally {
        process.exit();
    }
}
fix();
