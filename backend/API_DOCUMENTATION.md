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

## 🛍️ 2. Commandes & Panier (`/orders`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Client | **Paiement Immédiat** : Crée une commande et débite automatiquement le Wallet. |
| `GET` | `/orders/me` | Client | **Historique** : Liste toutes vos commandes avec leurs détails (items). |
| `PATCH` | `/orders/:id/status`| Ad/Transp| **Logistique** : Change le statut du paiement ou de la livraison. |

---

## 🚚 3. Logistique & Suivi Livraison (`/delivery`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/available` | Transpo* | **Marché des colis** : Liste les commandes payées prêtes au ramassage. |
| `POST` | `/assign` | Transpo* | **Prise en charge** : S'assigne un colis. Génère un **Code OTP**. |
| `POST` | `/tracking` | Transpo* | **GPS Localisation** : Enregistre les coordonnées actuelles. |
| `POST` | `/verify` | Transpo* | **Finalisation** : Le transporteur saisit l'OTP client. Libération des fonds. |

---

## 💰 4. Crédit & Financement Automatisé (`/credits`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/simulate` | Public | **Simulateur** : Calcule mensualités, coût total et taux. |
| `POST` | `/request` | Client | **Demande IA** : Score de Solvabilité IA calculé en temps réel. |
| `GET` | `/my` | Client | **Mes Financements** : Liste vos crédits et l'échéancier complet. |
| `POST` | `/pay/:id` | Client | **Remboursement** : Payer une mensualité spécifique via Wallet. |

---

## 📊 5. Statistiques & IA d'Affaires (`/stats`)

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
*Dernière mise à jour : 07 Avril 2026 | BCA Connect Dev Team - Robustesse & Sécurité Phase 2*
