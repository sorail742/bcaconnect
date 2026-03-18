# 🚀 Documentation API - BCA Connect (V2.0)

Bienvenue dans la documentation complète de l'API **BCA Connect**. Cette API alimente la plateforme de mise en relation entre commerçants locaux, acheteurs et transporteurs.

## 🌍 Informations de Base
- **Base URL** : `http://localhost:5000/api` (Développement) ou `https://bcaconnect.onrender.com/api` (Production)
- **Format** : `application/json`
- **Authentification** : JWT (JSON Web Token)
  - Header : `Authorization: Bearer <votre_token>`

---

## 🔐 1. Authentification (`/auth`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Création d'un compte (client, fournisseur, transporteur) |
| `POST` | `/auth/login` | Public | Connexion et obtention du token JWT |
| `GET` | `/auth/me` | User | Récupérer les informations du profil et le portefeuille |
| `PUT` | `/auth/update` | User | Mettre à jour le profil (nom, email, tel, password) |
| `DELETE` | `/auth/delete` | User | Supprimer son propre compte |

### Exemples de Corps (Auth)
**Register** : `{ "nom_complet", "email", "telephone", "mot_de_passe", "role" }`
**Update** : `{ "nom_complet"?, "telephone"?, "email"?, "mot_de_passe"? }`

---

## 🏬 2. Boutiques (`/stores`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stores` | Public | Lister toutes les boutiques actives |
| `GET` | `/stores/:id` | Public | Détails d'une boutique avec ses produits |
| `POST` | `/stores` | Fournisseur | Créer une boutique (une seule par utilisateur) |
| `GET` | `/stores/me` | Fournisseur | Voir ma propre boutique et ses produits |

---

## 📦 3. Produits (`/products`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Lister tous les produits |
| `GET` | `/products/:id` | Public | Détails d'un produit (avec catégorie) |
| `GET` | `/products/me/products` | Fournisseur | Voir mes propres produits |
| `POST` | `/products` | Fournisseur* | Créer un produit (Permission: `PRODUCTS_CREATE`) |
| `PUT` | `/products/:id` | Fournisseur* | Modifier un produit (Permission: `PRODUCTS_EDIT_OWN`) |
| `PATCH` | `/products/:id/stock` | Fournisseur* | Mise à jour rapide du stock |
| `DELETE` | `/products/:id` | Fournisseur* | Supprimer un produit |

---

## 🛒 4. Commandes (`/orders`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Client | Passer une commande (Paiement automatique via Wallet) |
| `GET` | `/orders/me` | Client | Historique de mes achats |
| `GET` | `/orders/vendor` | Fournisseur | Voir les commandes reçues pour mes produits |
| `PATCH` | `/orders/:orderId/status` | Client/Admin | Annuler ou retourner une commande (Remboursement auto) |
| `PATCH` | `/orders/item/:itemId/status` | Fournisseur | Gérer le statut d'un item spécifique |

**Format commande** : `{ "items": [ { "productId": "uuid", "quantity": 1 } ] }`

---

## 💳 5. Portefeuille & Paiements (`/wallet` & `/payments`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/wallet/me` | User | Voir son solde (Virtuel + Séquestre) et dernières transactions |
| `GET` | `/wallet/transactions` | User | Historique complet des transactions |
| `POST` | `/payments/initiate` | User | Initier un dépôt (Orange Money, etc.) |

---

## 🚚 6. Livraison (`/delivery`)

*Accès restreint aux utilisateurs avec le rôle `transporteur`.*

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/delivery/available` | Transporteur | Voir les commandes payées en attente de ramassage |
| `POST` | `/delivery/assign` | Transporteur | S'assigner une commande pour livraison |
| `PATCH` | `/delivery/status` | Transporteur | Mettre à jour (en_cours, livre) |

---

## 🤖 7. IA BCA (`/ai`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/ai/insights` | Fournisseur | Analyse des ventes et recommandations |
| `GET` | `/ai/trust-score` | User | Score de fiabilité basé sur l'activité |

---

## 📁 8. Catégories (`/categories`)
- `GET /categories` : Liste toutes les catégories.
- `POST /categories` : (Admin uniquement) Créer une catégorie.

---

## 🛠 Codes de Statut Commandes
- **Commande (`Order`)** : `payé`, `annulé`, `retourné`.
- **Livraison (`statut_livraison`)** : `en_attente`, `ramasse`, `en_cours`, `livre`.
- **Items (`OrderItem`)** : `en_attente`, `préparation`, `expédié`.

---
*Documentation mise à jour le 17 Mars 2026 - BCA Connect Dev Team*
