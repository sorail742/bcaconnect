# Architecture Technique - BCA Connect 🚀

Ce document définit les choix technologiques et la structure globale du projet pour le défi entreprise.

## 1. Stack Technologique (MERN-like adaptatif)
- **Backend** : Node.js avec le framework **Express**.
- **Base de Données** : **PostgreSQL** pour sa robustesse et sa gestion native du JSONB (utile pour l'IA).
- **ORM** : **Sequelize** pour la gestion sécurisée des modèles et des migrations.
- **Frontend** : Architecture **Premium UI** (HTML5/CSS3/Vanilla JS ou React/Vite selon besoin) avec focus sur l'expérience mobile.
- **Sécurité** : 
    - Authentification via **JWT** (JSON Web Tokens).
    - Hachage des mots de passe avec **Bcrypt/Argon2**.
    - UUID v4 pour tous les identifiants (Facilite la résilience hors-ligne).

## 2. Structure du Système (Modules)

### A. Cœur Marketplace (MVP)
- **Gestion Identity** : Inscription, Rôles (Admin, Fournisseur, Client, Transporteur, Banque).
- **Gestion Catalogue** : Boutiques, Catégories, Produits (Stock, Prix).
- **Gestion Ventes** : Commandes, Détails de commandes (Multi-vendeurs).

### B. Moteur Financier (Fintech)
- **Portefeuille Virtuel** : Solde disponible et **Solde Séquestre** (Escrow).
- **Système de Paiement** : Intégration Cinetpay/Mobile Money.
- **Split Payment** : Répartition automatique des revenus entre les acteurs.

### C. Intelligence Artificielle & Défense
- **Score de Confiance** : Calculé par l'IA pour évaluer la fiabilité des utilisateurs.
- **Audit System** : Logs détaillés pour la détection de fraude.
- **Validation IA** : Filtrage des produits et des transactions suspectes.

### D. Résilience Hors-Ligne (Offline First)
- **Stockage Local** : Utilisation d'IndexedDB/PWA pour stocker les catalogues et les paniers.
- **File de Sync** : Mécanisme de file d'attente pour soumettre les commandes dès le retour de la connexion.
- **Idempotence** : Utilisation de clés uniques pour éviter les doublons lors de la synchro.

## 3. Diagramme de Flux de Données (Simplifié)
```
[Client/App] <--> [API Gateway / Express] <--> [Sequelize ORM] <--> [PostgreSQL]
                        │                          │
                        └─> [Module IA]            └─> [Système Audit]
                        └─> [Module Sync]          └─> [Passerelle Paiement]
```

## 4. Stratégie de Déploiement
- Environnement de développement : Local avec Docker ou Postgres local.
- Production : Heroku / Render / VPS (Ubuntu).

---
*Document confirmé le 11 Mars 2026 - Version 1.0*