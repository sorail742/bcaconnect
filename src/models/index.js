const User = require('./User');
const Wallet = require('./Wallet');
const Store = require('./Store');
const Product = require('./Product');
const Category = require('./Category');

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

module.exports = {
    User,
    Wallet,
    Store,
    Product,
    Category
};
