# 📒 Journal de Bord Collaboratif - BCA Connect

Ce document sert de fil conducteur pour le développement en groupe. Il répertorie toutes les modifications, décisions techniques et étapes franchies pour assurer une synchronisation parfaite entre les développeurs.

---

## 🗓️ 05 Juin 2026 - Consolidation Pilote Phase 2

### Livraisons majeures
- **Achats groupés** : backend + frontend + seed + tests 20/20
- **Litiges interactifs** : workflow complet + tests Jest 14/14
- **Livraison** : 3 tiers (eco/standard/prioritaire), GPS transporteur, paiement wallet transporteur, admin logistique
- **Crédit banque** : approve/reject, dashboard banque, seed pending credits
- **SAV** : garanties, interventions, technicien (dashboard, missions, wallet)
- **Offline-first** : syncService, OfflineBanner, checkout COD hors ligne

### Sprint 3 — Expérience utilisateur
- **Avis produits** : `ReviewForm`, `GET /reviews/eligible`, validation commande livrée + anti-doublon
- **Achats groupés** : paiement wallet à l'engagement, remboursement si leave, stock + séquestre à la clôture
- **Publicités fournisseur** : permission `manage_ads`, route `/vendor/ads`, filtre `?mine=1`
- **Sidebar** : achats groupés (client), rapports + ads (fournisseur), retours (admin)
- **BankDashboard** : boutons morts remplacés par liens Crédits / Détails

### Sprint 2 — Intégrité métier
- **Crédit approuvé** → active commande liée (`confirmOrderPayment` + séquestre + notif)
- **payInstallment** → protection IDOR (ownership échéance)
- **Socket technicien** → `socketio` corrigé
- **Statut transaction** → `complete` harmonisé (order wallet)
- **Logout** → `POST /auth/logout` + révocation refresh token

### Corrections consolidation (Sprint 1)
- Checkout → redirect `/orders` (au lieu de `/dashboard/orders`)
- Sidebar rôle **banque** + RBAC frontend aligné backend
- Lien **Achats groupés** dans menu client
- Messages.jsx : `refetchConversations`
- Admin logistique : layout KPI

### Référence
- État complet documenté dans [`STATUS_CONSOLIDE.md`](./STATUS_CONSOLIDE.md)

---

## 🗓️ 01 Mai 2026 - Session (Développeur & Antigravity)

### 🏗️ Interface & Design
- **Standardisation Full-Width** : Passage de la mise en page de `container` à `w-full max-w-none` sur l'ensemble de la landing page (`Navbar`, `Hero`, `FeaturedProducts`, `CategorySection`).
- **Compactage UI** : Réduction de l'espacement dans la barre de navigation pour un aspect ERP plus professionnel.

### 📦 Catalogue & Données
- **Audit et Nettoyage** : Suppression du catalogue de test massif (200+ produits) pour revenir aux données réelles du projet.
- **Restauration d'Assets** : Correction et restauration des images pour les produits clés :
    - **Mangue Fraîche** : Image Unsplash haute qualité restaurée.
    - **Voiture (Lix, BPM, Sportives)** : Images Unsplash haute qualité restaurées.

### 🔍 Audit Logique Métier (Dynamisation)
- **Fintech** : Validation de la robustesse des transactions Wallet (Atomicité + Verrous pessimistes).
- **Logistique** : Vérification de la logique de frais de port dynamiques (Conakry vs Province) et validation par OTP.
- **IA** : Audit du moteur de scoring de crédit Alpha-BCA et de la recherche visuelle LLaMA-4.
- **Fintech (Séquestre)** : Implémentation complète de l'automatisation du séquestre. Les fonds vendeurs sont désormais bloqués à l'achat et libérés uniquement après validation OTP de la livraison.
- **Sécurité (DTO)** : Finalisation et application de la validation `express-validator` sur les routes critiques (Produits, Commandes, Portefeuille, Catégories) pour prévenir l'injection de données malveillantes.
- **Authentification (Google)** : Implémentation complète et validée en production locale. Bugs corrigés : (1) ancien Client ID en fallback dans le code supprimé, (2) `setAuth` absent du hook `useAuth` ajouté. La création automatique de compte Google est opérationnelle.

---

## 🗓️ 07 Juin 2026 - Phase 3 & setup équipe (2 devs)

### Contexte
- Commit `9fece84` — Phases 1+2 consolidées
- **Équipe de 2** : chaque dev a sa machine, sa base SQLite, son `.env` local

### Livraisons Phase 3 (démarrage)
- `backend/phase3 du developpement.md` — roadmap lancement
- `scripts/dev-backend.sh` — démarrage auto SQLite (sans Docker obligatoire)
- `scripts/docker-dev.sh` — Postgres optionnel + messages d'erreur Docker
- `backend/src/services/smsService.js` — SMS crédit (console / webhook)
- `backend/.env.example` + `EQUIPE_DEV.md` — onboarding identique pour les 2 devs
- Ports alignés : backend **5001**, frontend **3002**

### Règle équipe
- **Dev quotidien** : `./scripts/dev-backend.sh` (pas besoin de Postgres)
- **Postgres** : uniquement pour tests infra Phase 3 (machine avec Docker)
- **Sync** : `git pull` + `DEVELOPMENT_LOG.md` après chaque session

---
- [x] **Automatisation Séquestre** : Automatiser le passage en `solde_sequestre` lors de l'achat Wallet jusqu'à validation OTP.
- [x] **Validation DTO Globale** : Finaliser la couche de validation `express-validator` sur tous les endpoints restants.
- [x] **Authentification Google** : Connexion sociale Google testée et validée (Compte `Hassimiou Thioye` créé automatiquement).
- [ ] **Interface Vendeur** : Améliorer le dashboard de gestion des commandes pour les fournisseurs.

---

## 👥 Équipe de Développement
- **2 développeurs** — setup local indépendant (SQLite par défaut, `.env` non partagé)
- **Guide équipe :** [`EQUIPE_DEV.md`](./EQUIPE_DEV.md)
- **Assistant AI** : Antigravity

---
*Dernière mise à jour : 7 juin 2026*
