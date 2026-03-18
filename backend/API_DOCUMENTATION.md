# 🚀 Documentation API - BCA Connect (V2.6)

Bienvenue dans la documentation officielle de l'API **BCA Connect**. Cette API REST est conçue pour alimenter une plateforme robuste de commerce, logistique et finance (Crédit/Wallet).

---

## 🌍 Informations Globales
- **Base URL** : `http://localhost:5000/api`
- **Authentification** : Porteur de jeton JWT (`Authorization: Bearer <TOKEN>`)
- **Format** : Toutes les requêtes et réponses sont en **JSON**.
- **Sécurité** : 
  - Rate Limiting (AntidDoS)
  - Protection Brute-force sur le login (15 essais / 15 min)
  - Sanitisation Anti-XSS & Injections NoSQL.

---

## 🔑 1. Authentification & Profil (`/auth`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | **Inscription** : Requiert (nom_complet, email, telephone, mot_de_passe, role). Rôles : `client`, `fournisseur`, `transporteur`. |
| `POST` | `/auth/login` | Public | **Connexion** : Retourne un token JWT et les infos de l'utilisateur. |
| `GET` | `/auth/me` | Connecté| **Profil** : Récupère les infos complètes de l'utilisateur connecté (incluant son Wallet). |

---

## 🛍️ 2. Commandes & Panier (`/orders`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Client | **Paiement Immédiat** : Crée une commande et débite automatiquement le Wallet de l'utilisateur. |
| `GET` | `/orders/me` | Client | **Historique** : Liste toutes vos commandes avec leurs détails (items). |
| `PATCH` | `/orders/:id/status`| Client/Adm| **Annulation/Retour** : Change le statut du paiement ou de la livraison. |

---

## 🚚 3. Logistique & Suivi Livraison (`/delivery`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/available` | Transpo* | **Marché des colis** : Liste les commandes payées prêtes au ramassage. |
| `POST` | `/assign` | Transpo* | **Prise en charge** : S'assigne un colis. Génère un **Code OTP** envoyé au client. |
| `POST` | `/tracking` | Transpo* | **GPS Localisation** : Enregistre les coordonnées (lat, long) actuelles du colis. |
| `POST` | `/verify` | Transpo* | **Finalisation** : Le transporteur saisit l'OTP du client. Si correct, l'argent du séquestre est libéré au vendeur. |
| `GET` | `/history/:id` | Tous | **Trace GPS** : Historique complet des déplacements d'un colis spécifique. |

---

## 💰 4. Crédit & Financement Automatisé (`/credits`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/simulate` | Public | **Simulateur** : Calcule mensualités, coût total et taux sans créer de dossier. |
| `POST` | `/request` | Client | **Demande IA** : Soumet un dossier. Un **Score de Solvabilité IA** est calculé en temps réel pour aider l'admin. |
| `GET` | `/my` | Client | **Mes Financements** : Liste vos crédits et l'échéancier complet (dates et montants). |
| `POST` | `/pay/:id` | Client | **Remboursement** : Payer une mensualité spécifique via le Wallet. |
| `PUT` | `/:id/approve` | Admin | **Décision** : Approuver un crédit (génère l'échéancier auto). |

---

## 🛠️ 5. SAV, Support & Feedback IA (`/support`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/tickets` | Connecté| **Support Ticket** : Ouvrir une demande (Assistance, Installation, Maintenance). |
| `GET` | `/tickets/me`| Connecté| **Mes Demandes** : Suivre l'avancement de vos tickets Support. |
| `POST` | `/reviews` | Client | **Feedback IA** : Laisser un avis. Le système analyse le texte pour classer le sentiment (`positif`, `neutre`, `negatif`). |
| `PUT` | `/tickets/:id/resolve`| Admin | **Clôture** : Répondre ou fermer un ticket. |

---

## 📊 6. Statistiques & Intelligence d'Affaires (`/stats`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin` | Admin | **Dashboard Général** : GMV (Volume d'affaires), Revenus BCA, Distribution des utilisateurs et Croissance mensuelle. |
| `GET` | `/financial` | Admin | **Rapports Financiers** : Analyse détaillée des types de transactions et flux monétaires. |
| `GET` | `/trends` | Tous | **Prédictions IA** : Analyse de la demande future par catégories (ex: "Solaire : Forte hausse prévue"). |

---

## 📢 7. Régie Publicitaire & Marketing (`/ads`)

| Méthode | Endpoint | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/active` | Tous | **Affichage** : Récupère les bannières actives et ciblées selon le profil utilisateur. |
| `POST` | `/create` | Fournis* | **Campagne** : Créer une pub (Budget, Cible, Date). |
| `POST` | `/:id/click` | Public | **Statistiques** : Enregistre les clics pour mesurer le CTR (taux de clic). |

---

## ⚡ Codes de Statut Standardisés
- **200 OK** : Succès.
- **201 Created** : Ressource créée (Commande, Ticket, Avis).
- **401 Unauthorized** : Token manquant ou expiré.
- **403 Forbidden** : Rôle insuffisant (ex: client vers dashboard admin).
- **422 Unprocessable Content** : Données invalides (ex: email mal formé).
- **500 Internal Error** : Erreur serveur (logguée dans `src/logs/error.log`).

---
*Dernière mise à jour : 18 Mars 2026 | BCA Connect Dev Team - Robustesse & Intelligence IA*
