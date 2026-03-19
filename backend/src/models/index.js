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
const Publicite = require('./Publicite');
const PubliciteCiblage = require('./PubliciteCiblage');
const PubliciteStat = require('./PubliciteStat');
const PaiementPublicite = require('./PaiementPublicite');
const Litige = require('./Litige');
const Credit = require('./Credit');
const Echeancier = require('./Echeancier');
const DeliveryLog = require('./DeliveryLog');
const Ticket = require('./Ticket');
const Review = require('./Review');
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
OrderItem.belongsTo(Order, { foreignKey: 'commande_id', as: 'commande' });

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

// 8. Relations Publicités
Publicite.hasMany(PubliciteCiblage, { foreignKey: 'publicite_id', as: 'ciblages' });
PubliciteCiblage.belongsTo(Publicite, { foreignKey: 'publicite_id' });

Publicite.hasMany(PubliciteStat, { foreignKey: 'publicite_id', as: 'stats' });
PubliciteStat.belongsTo(Publicite, { foreignKey: 'publicite_id' });

Publicite.hasMany(PaiementPublicite, { foreignKey: 'publicite_id', as: 'paiements' });
PaiementPublicite.belongsTo(Publicite, { foreignKey: 'publicite_id' });

User.hasMany(Publicite, { foreignKey: 'vendeur_id', as: 'publicites' });
Publicite.belongsTo(User, { foreignKey: 'vendeur_id', as: 'vendeur' });

User.hasMany(PaiementPublicite, { foreignKey: 'utilisateur_id' });
PaiementPublicite.belongsTo(User, { foreignKey: 'utilisateur_id' });

// 9. Relations Litiges
Order.hasMany(Litige, { foreignKey: 'commande_id', as: 'litiges' });
Litige.belongsTo(Order, { foreignKey: 'commande_id' });

User.hasMany(Litige, { foreignKey: 'demandeur_id', as: 'litiges_ouverts' });
Litige.belongsTo(User, { foreignKey: 'demandeur_id', as: 'demandeur' });

User.hasMany(Litige, { foreignKey: 'defenseur_id', as: 'litiges_contre' });
Litige.belongsTo(User, { foreignKey: 'defenseur_id', as: 'defenseur' });

// 10. Relations Crédit & Financement
User.hasMany(Credit, { foreignKey: 'utilisateur_id', as: 'credits' });
Credit.belongsTo(User, { foreignKey: 'utilisateur_id' });

Order.hasOne(Credit, { foreignKey: 'commande_id' });
Credit.belongsTo(Order, { foreignKey: 'commande_id' });

Credit.hasMany(Echeancier, { foreignKey: 'credit_id', as: 'echeances' });
Echeancier.belongsTo(Credit, { foreignKey: 'credit_id' });

// 11. Relations Transport & Tracking (Phase 10)
Order.hasMany(DeliveryLog, { foreignKey: 'order_id', as: 'tracking_history' });
DeliveryLog.belongsTo(Order, { foreignKey: 'order_id' });

// 12. Relations SAV & Feedback (Phase 12)
User.hasMany(Ticket, { foreignKey: 'utilisateur_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'utilisateur_id' });

Order.hasMany(Ticket, { foreignKey: 'commande_id' });
Ticket.belongsTo(Order, { foreignKey: 'commande_id' });

Product.hasMany(Review, { foreignKey: 'produit_id', as: 'avis' });
Review.belongsTo(Product, { foreignKey: 'produit_id' });

User.hasMany(Review, { foreignKey: 'utilisateur_id' });
Review.belongsTo(User, { foreignKey: 'utilisateur_id' });

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
    Publicite,
    PubliciteCiblage,
    PubliciteStat,
    PaiementPublicite,
    Litige,
    Credit,
    Echeancier,
    DeliveryLog,
    Ticket,
    Review,
    sequelize
};
