'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('utilisateurs').catch(() => null);
    if (!table) return;

    const addIfMissing = async (column, definition) => {
      if (!table[column]) {
        await queryInterface.addColumn('utilisateurs', column, definition);
      }
    };

    await addIfMissing('specialites', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addIfMissing('numero_agrement', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await addIfMissing('zone_intervention', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('utilisateurs', 'specialites').catch(() => {});
    await queryInterface.removeColumn('utilisateurs', 'numero_agrement').catch(() => {});
    await queryInterface.removeColumn('utilisateurs', 'zone_intervention').catch(() => {});
  },
};
