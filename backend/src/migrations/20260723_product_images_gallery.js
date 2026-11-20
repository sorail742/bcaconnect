'use strict';

const { randomUUID } = require('crypto');

/**
 * Galerie multi-images produit (style Alibaba) — table dédiée `images_produits`.
 * `produits.image_url` reste la couverture (compat avec le reste de l'app) ;
 * chaque image existante est reprise comme première image de la galerie.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const existingTable = await queryInterface.describeTable('images_produits').catch(() => null);

        if (!existingTable) {
            await queryInterface.createTable('images_produits', {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                },
                produit_id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: { model: 'produits', key: 'id' },
                    onDelete: 'CASCADE',
                },
                url_image: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                ordre: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0,
                },
                created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
                updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            });
            await queryInterface.addIndex('images_produits', ['produit_id']);
        }

        // Backfill : chaque produit ayant déjà une image_url devient la première
        // image de sa nouvelle galerie (idempotent — ne s'exécute que si vide).
        const [existing] = await queryInterface.sequelize.query('SELECT COUNT(*)::int AS count FROM images_produits');
        if (existing[0]?.count === 0) {
            const [products] = await queryInterface.sequelize.query(
                "SELECT id, image_url FROM produits WHERE image_url IS NOT NULL AND image_url <> ''"
            );
            if (products.length > 0) {
                const now = new Date();
                await queryInterface.bulkInsert('images_produits', products.map((p) => ({
                    id: randomUUID(),
                    produit_id: p.id,
                    url_image: p.image_url,
                    ordre: 0,
                    created_at: now,
                    updated_at: now,
                })));
            }
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('images_produits').catch(() => {});
    },
};
