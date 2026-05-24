/**
 * 🌱 BCA Connect — Script de seeding local (SQLite)
 * Usage: node seed.js
 * Crée des comptes de test pour tous les rôles.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Force SQLite local
process.env.DATABASE_URL = '';

const sequelize = require('./src/config/database');
const { User, Wallet } = require('./src/models');

const USERS = [
  {
    id: uuidv4(),
    nom_complet: 'Admin BCA',
    email: 'admin@bca.com',
    telephone: '0600000001',
    mot_de_passe: 'Admin@123',
    role: 'admin',
    est_approuve: true,
    statut: 'actif',
  },
  {
    id: uuidv4(),
    nom_complet: 'Client Test',
    email: 'client@bca.com',
    telephone: '0600000002',
    mot_de_passe: 'Client@123',
    role: 'client',
    est_approuve: true,
    statut: 'actif',
  },
  {
    id: uuidv4(),
    nom_complet: 'Vendeur Test',
    email: 'vendeur@bca.com',
    telephone: '0600000003',
    mot_de_passe: 'Vendeur@123',
    role: 'fournisseur',
    est_approuve: true,
    statut: 'actif',
    categorie_activite: 'Mode',
    registre_commerce: 'RC-12345',
  },
  {
    id: uuidv4(),
    nom_complet: 'Transporteur Test',
    email: 'transporteur@bca.com',
    telephone: '0600000004',
    mot_de_passe: 'Transport@123',
    role: 'transporteur',
    est_approuve: true,
    statut: 'actif',
    metadata_transporteur: {
      type_vehicule: 'moto',
      numero_permis: 'PERM-99999',
      zone_couverture: 'Dakar',
      disponibilite: 'temps_plein',
    },
  },
];

async function seed() {
  try {
    console.log('🔄 Recréation de la base de données SQLite (drop + create)...');
    await sequelize.sync({ force: true });
    console.log('✅ Base synchronisée.');

    for (const userData of USERS) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`⚠️  Utilisateur existant ignoré : ${userData.email}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.mot_de_passe, salt);
      const plainPassword = userData.mot_de_passe;

      const user = await User.create({
        ...userData,
        mot_de_passe: hashedPassword,
      });

      await Wallet.create({ user_id: user.id });

      console.log(`✅ Créé [${user.role}] : ${user.email}  |  mot de passe : ${plainPassword}`);
    }

    console.log('\n🎉 Seeding terminé ! Vous pouvez vous connecter avec :');
    console.log('────────────────────────────────────────────────');
    USERS.forEach(u => {
      console.log(`  [${u.role.padEnd(12)}] ${u.email.padEnd(28)} | ${u.mot_de_passe}`);
    });
    console.log('────────────────────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur de seeding :', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
