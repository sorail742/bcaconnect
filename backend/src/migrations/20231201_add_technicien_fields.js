/* eslint-disable strict */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('utilisateurs', 'specialites', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Spécialités du technicien (ex: plomberie, électricité)"
    });
    await queryInterface.addColumn('utilisateurs', 'numero_agrement', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Numéro d'agrément du technicien (optionnel)"
    });
    await queryInterface.addColumn('utilisateurs', 'zone_intervention', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Zone d'intervention du technicien"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('utilisateurs', 'specialites');
    await queryInterface.removeColumn('utilisateurs', 'numero_agrement');
    await queryInterface.removeColumn('utilisateurs', 'zone_intervention');
  }
};
