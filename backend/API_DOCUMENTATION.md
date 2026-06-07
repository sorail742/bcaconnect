# 🚀 Documentation API - BCA Connect (V2.6)

Bienvenue dans la documentation officielle de l'API **BCA Connect**. Cette API REST est conçue pour alimenter une plateforme robuste de commerce, logistique et finance (Crédit/Wallet).

---

## 🌍 Informations Globales
- **Base URL** : `http://localhost:5000/api`
- **Authentification** : Porteur de jeton JWT (`Authorization: Bearer <TOKEN>`)
- **Format** : Toutes les requêtes et réponses sont en **JSON**.
- **Sécurité (Standard BCA v2.6)** : 
  - JWT Asymétrique (**RS256**) & Rotation.
  - **Défense Périphérique** : Helmet (CSP, HSTS), Rate Limiting.
  - **Chiffrement AES-256-GCM** des Sensitive Data (PII).
  - **Monitoring** : Sentry Error Tracking & Winston Logs.
  - **Validation DTO** : express-validator strict.

---

## 🔑 1. Authentification & Sécurité (`/auth`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | **Inscription** : Requiert (nom_complet, email, telephone, mot_de_passe, role). |
| `POST` | `/auth/login` | Public | **Connexion** : Retourne un token JWT. Si 2FA activé, retourne `require2FA: true`. |
| `POST` | `/auth/verify-2fa`| Public*| **Vérification 2FA** : Envoie (userId, code) pour obtenir les tokens finaux. |
| `POST` | `/auth/refresh` | Public | **Rotation** : Envoie (refreshToken, userId) pour obtenir une nouvelle paire de tokens. |
| `GET` | `/auth/me` | Connecté| **Profil** : Récupère les infos complètes de l'utilisateur connecté. |
| `GET` | `/setup-2fa` | Connecté| **Configuration 2FA** : Génère le QR Code et les codes de backup. |
| `POST` | `/confirm-2fa` | Connecté| **Activation 2FA** : Confirme le code TOTP pour activer le service. |

---

## 🛍️ 2. Commandes (`/orders`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Client | **Créer commande** : `items[]`, `deliveryInfo`, `paymentMethod` (`wallet` \| `mobile_money`). Wallet → débit immédiat + séquestre. MM → `en_attente_paiement`. |
| `GET` | `/orders/me` | Client | **Historique** : pagination `?page=&limit=`. |
| `GET` | `/orders/vendor` | Fournisseur | Commandes contenant vos produits. |
| `GET` | `/orders/:id` | Client/Vendeur/Admin | Détail commande + items. |
| `PATCH` | `/orders/:orderId/status` | Client/Admin | Annulation / retour (transitions strictes). |
| `PATCH` | `/orders/items/:itemId/status` | Fournisseur | Flux vendeur : `prepare`, `expedie`, `livre` (statut uniquement — séquestre libéré à l'OTP transporteur). |

---

## 💳 3. Paiements Mobile Money — CinetPay (`/payments`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/initiate` | Connecté | Initie un paiement. Body : `{ montant, moyen_paiement?, order_id? }`. Sans `order_id` → recharge wallet. Avec `order_id` → paiement commande + séquestre au webhook. |
| `POST` | `/payments/webhook` | **Public (CinetPay)** | Notification HMAC SHA256 (`PAYMENT_SECRET`). Confirme transaction + crédite wallet ou active séquestre commande. |
| `POST` | `/payments/capture-simulation` | Connecté | **Dev uniquement** — simule succès si clés CinetPay absentes. |

**Flux commande Mobile Money :**
1. `POST /orders` avec `paymentMethod: mobile_money` → statut `en_attente_paiement`
2. `POST /payments/initiate` avec `order_id` + `montant` (= `total_ttc`)
3. Redirection CinetPay → webhook → commande `payé` + séquestre vendeurs

---

## 🚚 4. Logistique & Suivi (`/delivery`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/delivery/track/:trackingNumber` | Public | Suivi commande (sans auth). |
| `GET` | `/delivery/available` | Transporteur | Colis prêts au ramassage. |
| `GET` | `/delivery/mine` | Transporteur | Missions assignées. |
| `GET` | `/delivery/groups/my` | Transporteur | Livraisons groupées. |
| `GET` | `/delivery/stats` | Transporteur | KPI : assignées, en cours, complétées, CO₂. |
| `POST` | `/delivery/assign` | Transporteur | Prise en charge + génération OTP client. |
| `POST` | `/delivery/tracking` | Transporteur | GPS + statut (`en_route`, `ramasse`, etc.). |
| `POST` | `/delivery/verify` | Transporteur | OTP client → libération escrow transporteur. |
| `POST` | `/delivery/group` | Transporteur | Regrouper plusieurs commandes. |
| `GET` | `/delivery/history/:orderId` | Connecté | Historique tracking d'une commande. |

---

## ⚖️ 5. Litiges & Médiation IA (`/disputes`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/disputes` | Client | Ouvrir litige : `{ commande_id, type, description, defenseur_id, preuves? }`. |
| `GET` | `/disputes/my` | Connecté | Litiges où vous êtes demandeur ou défenseur. |
| `GET` | `/disputes/:id` | Partie/Admin | Détail litige. |
| `GET` | `/disputes/admin` | Admin | Tous les litiges. |
| `PUT` | `/disputes/:id/status` | Admin | Changer statut : `ouvert`, `en_cours`, `en_mediation`, `resolu`, `ferme`. |
| `PUT` | `/disputes/:id/resolve` | Admin | Résolution + remboursement auto escrow. Body : `{ decision_finale, resolution_type, remboursement_montant? }`. |

**Types de résolution (`resolution_type`) :**
- `mediation_seule` — pas de mouvement financier
- `remboursement_integral` / `remboursement_partiel` / `bon_achat` — reverse escrow + crédit acheteur
- `liberation_vendeur` — libère séquestre vendeur

---

## 💰 6. Portefeuille & Séquestre (`/wallet`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/wallet/me` | Connecté | Solde virtuel + séquestre + 10 dernières transactions. |
| `GET` | `/wallet/transactions` | Connecté | Historique paginé. |
| `POST` | `/wallet/transfer` | Connecté | Transfert P2P atomique (verrous pessimistes). |
| `POST` | `/wallet/recharge` | Admin/Banque | Recharge manuelle (back-office). |

---

## 💰 7. Crédit & Financement (`/credits`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/simulate` | Public | **Simulateur** : Calcule mensualités, coût total et taux. |
| `POST` | `/request` | Client | **Demande IA** : Score de Solvabilité IA calculé en temps réel. |
| `GET` | `/my` | Client | **Mes Financements** : Liste vos crédits et l'échéancier complet. |
| `POST` | `/pay/:id` | Client | **Remboursement** : Payer une mensualité spécifique via Wallet. |

---

## 📊 8. Statistiques & IA (`/stats`, `/ai`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin` | Admin | **Dashboard** : GMV, Revenus BCA, Distribution et Croissance. |
| `GET` | `/financial` | Admin | **Rapports Financiers** : Flux monétaires détaillés. |
| `GET` | `/trends` | Tous | **IA Prédiction** : Analyse de la demande future par catégories. |

---

## ⚡ Codes de Statut Standardisés
- **200 OK** : Succès.
- **201 Created** : Ressource créée.
- **401 Unauthorized** : Token manquant ou expiré.
- **403 Forbidden** : Rôle insuffisant.
- **422 Unprocessed** : Validation DTO échouée (Erreur 2FA ou Input).
- **500 Error** : Interne (Sentry logguée).

---
*Dernière mise à jour : 03 Juin 2026 | BCA Connect v2.6 — Escrow, Litiges, CinetPay*
