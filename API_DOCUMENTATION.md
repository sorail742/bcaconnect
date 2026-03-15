# 🚀 Documentation API - BCA Connect (Phase 1)

Bienvenue dans la documentation de l'API BCA Connect. Cette API est conçue pour alimenter une plateforme de mise en relation entre commerçants locaux et acheteurs, avec une gestion intégrée des stocks et des commandes.

## 🌍 Informations de Base
- **URL de Production** : [https://bcaconnect.onrender.com](https://bcaconnect.onrender.com)
- **Format des données** : `application/json`
- **Authentification** : Porteur de Token (JWT). Ajoutez le header suivant à vos requêtes protégées :
  ```http
  Authorization: Bearer <votre_token_jwt>
  ```

---

## 🔐 1. Authentification (`/api/auth`)

### Inscription d'un utilisateur
- **Endpoint** : `POST /api/auth/register`
- **Body** :
```json
{
  "nom_complet": "Jean Dupont",
  "email": "jean@example.com",
  "telephone": "0600000000",
  "mot_de_passe": "MotsDePasseSecret123",
  "role": "provider" 
}
```
> Note: `role` peut être `client` ou `provider`.

### Connexion
- **Endpoint** : `POST /api/auth/login`
- **Body** :
```json
{
  "email": "jean@example.com",
  "mot_de_passe": "MotsDePasseSecret123"
}
```
- **Réponse (Succès)** :
```json
{
  "token": "eyJhbG...",
  "user": { "id": "uuid", "nom_complet": "...", "role": "..." }
}
```

---

## 🏬 2. Boutiques (`/api/stores`)

### Créer une boutique (Vendeurs uniquement)
- **Endpoint** : `POST /api/stores`
- **Body** :
```json
{
  "nom_boutique": "Ma Super Boutique",
  "description": "Vente de produits électroniques"
}
```

### Récupérer ma boutique
- **Endpoint** : `GET /api/stores/me`

### Lister toutes les boutiques actives
- **Endpoint** : `GET /api/stores`

---

## 📦 3. Produits (`/api/products`)

### Ajouter un produit (Vendeurs uniquement)
- **Endpoint** : `POST /api/products`
- **Body** :
```json
{
  "nom_produit": "iPhone 15",
  "description": "Dernier cri",
  "prix_unitaire": 1200.00,
  "stock_quantite": 10,
  "categorie_id": "uuid_de_la_categorie"
}
```

### Lister tous les produits
- **Endpoint** : `GET /api/products`

---

## 🛒 4. Commandes (`/api/orders`)

### Créer une commande
- **Endpoint** : `POST /api/orders`
- **Body** :
```json
{
  "items": [
    { "productId": "uuid_produit_1", "quantity": 2 },
    { "productId": "uuid_produit_2", "quantity": 1 }
  ]
}
```

### Historique de mes commandes
- **Endpoint** : `GET /api/orders/my-orders`

---

## 📁 5. Catégories (`/api/categories`)

### Lister les catégories
- **Endpoint** : `GET /api/categories`

---

## 💳 6. Paiements & Portefeuille (`/api/payments`)

### Initier un dépôt (Rechargement de compte)
- **Endpoint** : `POST /api/payments/initiate`
- **Body** :
```json
{
  "montant": 5000,
  "moyen_paiement": "orange_money"
}
```
- **Réponse** :
```json
{
  "message": "Transaction initiée",
  "payment_url": "https://...",
  "transaction_id": "uuid"
}
```

### Vérifier son solde
- **Endpoint** : `GET /api/auth/me` (Le champ `portefeuille.solde_virtuel` contient le solde actuel).

---

## 🚚 7. Logistique & Livraison (`/api/delivery`)
*Reservé au rôle `transporteur`*

### Voir les commandes à livrer
- **Endpoint** : `GET /api/delivery/available`

### Accepter une livraison
- **Endpoint** : `POST /api/delivery/assign`
- **Body** : `{ "orderId": "uuid" }`

### Mettre à jour le statut
- **Endpoint** : `PATCH /api/delivery/status`
- **Body** : `{ "orderId": "uuid", "status": "en_cours" }` 
> Note: Les status possibles sont `ramasse`, `en_cours`, `livre`.

---

## ⚠️ Gestion des Erreurs
L'API utilise les codes HTTP standards :
- `200/201` : Succès
- `400` : Requête mal formée (champs manquants)
- `401` : Non authentifié (Token manquant ou invalide)
- `403` : Accès refusé (Droits insuffisants)
- `404` : Ressource non trouvée
- `500` : Erreur interne du serveur

---
*Documentation générée par Antigravity - BCA Connect Team*
