const User = require('./User');
const Wallet = require('./Wallet');
const Store = require('./Store');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');
const SyncQueue = require('./SyncQueue');
const sequelize = require('../config/database');

// 1. Relations Utilisateur - Portefeuille
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'portefeuille' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

// 2. Relations Utilisateur - Boutique
User.hasOne(Store, { foreignKey: 'proprietaire_id', as: 'boutique' });
Store.belongsTo(User, { foreignKey: 'proprietaire_id' });

// 3. Relations Boutique - Produit
Store.hasMany(Product, { foreignKey: 'boutique_id', as: 'produits' });
Product.belongsTo(Store, { foreignKey: 'boutique_id' });

// 4. Relations Catégorie - Produit
Category.hasMany(Product, { foreignKey: 'categorie_id', as: 'produits' });
Product.belongsTo(Category, { foreignKey: 'categorie_id', as: 'categorie' });

// 5. Relations Commandes
User.hasMany(Order, { foreignKey: 'utilisateur_id', as: 'commandes' });
Order.belongsTo(User, { foreignKey: 'utilisateur_id' });

Order.hasMany(OrderItem, { foreignKey: 'commande_id', as: 'details' });
OrderItem.belongsTo(Order, { foreignKey: 'commande_id' });

Product.hasMany(OrderItem, { foreignKey: 'produit_id' });
OrderItem.belongsTo(Product, { foreignKey: 'produit_id', as: 'produit' });

User.hasMany(OrderItem, { foreignKey: 'fournisseur_id', as: 'ventes' });
OrderItem.belongsTo(User, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// 6. Relations Transactions
Wallet.hasMany(Transaction, { foreignKey: 'portefeuille_id', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'portefeuille_id' });

Order.hasOne(Transaction, { foreignKey: 'commande_id' });
Transaction.belongsTo(Order, { foreignKey: 'commande_id' });

// 7. Audit & Sync
User.hasMany(AuditLog, { foreignKey: 'utilisateur_id' });
AuditLog.belongsTo(User, { foreignKey: 'utilisateur_id' });

User.hasMany(SyncQueue, { foreignKey: 'utilisateur_id' });
SyncQueue.belongsTo(User, { foreignKey: 'utilisateur_id' });

module.exports = {
    User,
    Wallet,
    Store,
    Product,
    Category,
    Order,
    OrderItem,
    Transaction,
    AuditLog,
    SyncQueue,
    sequelize
};
