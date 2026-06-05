# BCA Connect

**Marketplace B2B fintech pour la Guinée** — plateforme digitale reliant acheteurs, fournisseurs, transporteurs, techniciens SAV et partenaires financiers autour d’un écosystème d’achat sécurisé, de crédit et de logistique.

> Ce document présente **l’ensemble des travaux réalisés** sur le projet : design, frontend, backend, sécurité, paiements, litiges et déploiement.

---

## Table des matières

1. [Vision & objectifs](#vision--objectifs)
2. [Stack technique](#stack-technique)
3. [Travaux réalisés — synthèse](#travaux-réalisés--synthèse)
4. [Landing page & identité BCA](#landing-page--identité-bca)
5. [Marketplace & catalogue](#marketplace--catalogue)
6. [Rôles & tableaux de bord](#rôles--tableaux-de-bord)
7. [Paiements, escrow & Mobile Money](#paiements-escrow--mobile-money)
8. [Litiges & remboursements](#litiges--remboursements)
9. [Crédit & financement](#crédit--financement)
10. [Logistique & livraison](#logistique--livraison)
11. [Intelligence artificielle](#intelligence-artificielle)
12. [Sécurité & qualité API](#sécurité--qualité-api)
13. [Architecture du projet](#architecture-du-projet)
14. [Installation & démarrage](#installation--démarrage)
15. [Tests & CI](#tests--ci)
16. [Déploiement production](#déploiement-production)
17. [Historique des livraisons récentes](#historique-des-livraisons-récentes)

---

## Vision & objectifs

BCA Connect répond aux défis des chaînes d’approvisionnement en Guinée :

- **Fragmentation** des marchés et difficulté à trouver des fournisseurs fiables
- **Manque de confiance** dans les transactions B2B
- **Accès limité au financement** (crédit, paiement échelonné)
- **Logistique coûteuse** entre Conakry et l’intérieur du pays

La plateforme vise à devenir une **centrale d’achat virtuelle** avec paiement sécurisé (escrow), suivi des commandes, gestion SAV, simulateur de crédit et outils IA pour la décision d’achat.

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18, Vite 7, Tailwind CSS, Framer Motion, Zustand, TanStack Query, Socket.io-client, PWA |
| **Backend** | Node.js, Express, Sequelize, PostgreSQL, Redis |
| **Paiements** | CinetPay (Orange Money / MTN — Guinée) via `paymentProviderService` |
| **IA** | Groq API (`aiService`) — assistant achat, tendances marché |
| **Temps réel** | Socket.io (notifications, messages, suivi) |
| **Conteneurs** | Docker Compose (Postgres, Redis, backend, frontend) |
| **CI** | GitHub Actions (workflows sécurité & tests) |

---

## Travaux réalisés — synthèse

| Domaine | Réalisations clés |
|---------|-------------------|
| **Design / UX** | Identité visuelle BCA (orange `#FF6600`), tokens CSS, landing professionnelle, mega-menu catégories, carousel promo |
| **Marketplace** | Catalogue filtrable, fiche produit B2B (MOQ, fournisseur vérifié), cartes produit sans friction |
| **Multi-rôles** | Admin, client, fournisseur, transporteur, technicien, banque — routes et permissions dédiées |
| **Paiements** | Portefeuille, dépôt Mobile Money, webhook CinetPay, simulation sandbox |
| **Escrow** | Fonds bloqués jusqu’à livraison confirmée, flag `escrow_released`, service dédié |
| **Litiges** | Signalement, workflow admin, preuves, remboursement automatique escrow |
| **Crédit** | Simulateur, calendrier d’échéances, rappels cron, tableau de bord crédits |
| **Logistique** | Groupes de livraison, suivi GPS, dashboard transporteur |
| **Technicien SAV** | Nouveau rôle : missions, équipements, routes API dédiées |
| **Sécurité** | Validation globale DTO, chiffrement étendu, 2FA, tests auth/escrow/disputes |
| **API / Dev** | Proxy Vite corrigé, fallbacks landing si backend offline, requêtes silencieuses `_bg` |

---

## Landing page & identité BCA

### Structure de la page d’accueil

```
[Navbar + mega-menu « Toutes les catégories »]
[Carousel promo — LandingTopCarousel]
[Bienvenue BCA Connect + BcaTrustBar]
[CategorySection : sidebar catégories + produits]
[FeaturedProducts]
[MarketTrendsSection — tendances marché + IA]
[SupplierBanner, AISection, HowItWorks, RolesSection…]
```

### Composants créés / refactorisés

| Fichier | Rôle |
|---------|------|
| `LandingTopCarousel.jsx` | Bandeau animé pleine largeur (après navbar) |
| `BcaMegaMenu.jsx` | Mega-menu au survol « Toutes les catégories » |
| `BcaCategorySidebar.jsx` | Sidebar catégories avec chevrons et « Voir plus » |
| `BcaCategoryMegaPanel.jsx` | Panneau sous-catégories (icônes circulaires) |
| `BcaTrustBar.jsx` | Bandeau confiance (Escrow, fournisseurs vérifiés, Mobile Money…) |
| `LandingProductCard.jsx` | Carte discovery — clic vers fiche, sans boutons achat |
| `CategorySection.jsx` | Bloc sidebar + grille produits (capture UX cible) |
| `bcaLandingContent.js` | Données mock sous-catégories mega-menu |
| `categoryConstants.jsx` | `BCA_ICONS`, `BCA_CATEGORIES` (38 catégories) |
| `design.css` | Tokens et classes `.bca-*` (cartes, boutons, badges, toolbar) |

### Renommage identité

L’ensemble du code a été **rebrandé de « Alibaba » vers « BCA »** :

- Fichiers : `Alibaba*.jsx` → `Bca*.jsx`
- Constantes : `ALIBABA_*` → `BCA_*`
- Classes CSS : `ali-*` → `bca-*`
- Variante composants : `variant="bca"` sur `ProductCard` / `ProductPrice`

---

## Marketplace & catalogue

### Catalogue (`/marketplace`)

- Sidebar filtres style BCA (catégorie, prix, condition, fournisseur vérifié)
- Toolbar tri (nouveautés, prix, popularité) + modes grille / liste
- Tuiles promo et bandeau confiance
- Pagination et recherche full-text

### Fiche produit (`/product/:id`)

- Fil d’Ariane, badges trade / vérifié / MOQ
- Buy box B2B : prix « à partir de », quantité, chat fournisseur, escrow
- Onglets description, spécifications, avis
- Barre d’action sticky mobile

### Cartes produit

- Variante **grid** et **list** pour le catalogue
- Prix format GNF, ancien prix barré, indicateur fournisseur certifié
- Intégration panier, wishlist et chat

---

## Rôles & tableaux de bord

| Rôle | Route dashboard | Fonctionnalités |
|------|-----------------|-----------------|
| **Client** | `/dashboard` | Commandes, crédits, litiges, wallet |
| **Fournisseur** | `/vendor/dashboard` | Produits, commandes, boutique, rapports |
| **Transporteur** | `/carrier/dashboard` | Livraisons assignées, suivi |
| **Technicien** | `/technician/dashboard` | Missions SAV, équipements |
| **Banque** | `/bank/dashboard` | Partenaire financement |
| **Admin** | `/admin/dashboard` | Users, produits, litiges, pub, catégories |

### Nouveau : rôle Technicien

- Migration `20231201_add_technicien_fields.js`
- Modèle utilisateur étendu (champs technicien)
- `technicianController.js` + `technicianRoutes.js`
- Pages : `TechnicianDashboard`, `TechnicianMissions`, `TechnicianEquipment`
- Service frontend `technicianService.js` + hooks `useTechnicianData`

---

## Paiements, escrow & Mobile Money

### Flux portefeuille

1. L’utilisateur initie un dépôt via `/api/payments/initiate`
2. Redirection CinetPay (Orange Money / MTN)
3. Webhook `/api/payments/webhook` confirme la transaction
4. Solde wallet mis à jour

### Escrow (séquestre)

- Lors d’une commande, les fonds sont **bloqués** jusqu’à confirmation de livraison
- Colonne `escrow_released` sur `details_commandes`
- Service `escrowService.js` : libération ou remboursement automatique
- Tests dédiés : `backend/tests/escrow.test.js`

### Fichiers clés

- `paymentProviderService.js` — intégration CinetPay v2
- `paymentController.js` — initiate, webhook, simulation
- `walletController.js` — solde, historique, retraits
- Guide prod : [`backend/DEPLOYMENT_PROD.md`](backend/DEPLOYMENT_PROD.md)

---

## Litiges & remboursements

### Parcours utilisateur

1. Signalement depuis une commande (`DisputeReport.jsx`, `MyDisputes.jsx`)
2. Upload de preuves, description du problème
3. Suivi du statut côté client

### Parcours admin

- `AdminDisputes.jsx` — timeline des phases, preuves, décision
- Types de résolution et montant remboursé
- Remboursement auto via escrow si litige validé
- Migration `20260602_escrow_and_disputes.js`
- Tests : `backend/tests/disputes.test.js`

---

## Crédit & financement

| Page / module | Description |
|---------------|-------------|
| `CreditSimulator.jsx` | Simulation mensualités, taux, durée |
| `CreditCalendar.jsx` | Calendrier visuel des échéances |
| `MyCredits.jsx` | Crédits actifs et historique |
| `creditReminderCron.js` | Rappels automatiques avant échéance |
| `GroupPurchase.jsx` | Achats groupés (expérimentation B2B) |

---

## Logistique & livraison

- Modèle `DeliveryGroup.js` — livraisons groupées
- `deliveryController.js` — assignation transporteur, statuts
- `Tracking.jsx` — suivi commande côté client
- `CarrierDashboard.jsx` — vue transporteur
- Script utilitaire `backend/test-logistics.js`
- Hooks `useDeliveryData`, `useCarrierData`

---

## Intelligence artificielle

- **`AiMode.jsx`** — assistant conversationnel achat (style chat BCA)
- **`MarketTrendsSection.jsx`** — tendances marché avec fallback démo si API offline
- **`aiService.js` (backend)** — prompts Groq, suggestions catégories, analyse produits
- **`AIChat.jsx`** — widget chat intégré navbar / pages
- Admin : `AITrends.jsx` pour la supervision

---

## Sécurité & qualité API

### Backend

- `catchAsync` sur les contrôleurs critiques
- `globalValidation.js` + `dtoValidator.js` — validation centralisée des entrées
- `inputValidator.js` — sanitization
- Chiffrement étendu des champs sensibles (`ENCRYPTION_KEY`)
- Auth JWT RS256 + refresh tokens Redis
- 2FA (TOTP) — setup / confirm / verify
- `authMiddleware.js` — rôles et permissions granulaires

### Frontend

- `ProtectedRoute.jsx` — garde par rôle
- `permissions.js` — matrice droits UI
- Validation Zod côté formulaires (`validation.js`)
- Requêtes landing en arrière-plan (`_bg: true`) pour éviter les toasts d’erreur

### CI / tests

- `.github/workflows/security.yml` — audit dépendances
- `auth.test.js`, `escrow.test.js`, `disputes.test.js`
- `test-global-validation.js` — smoke validation API

---

## Architecture du projet

```
bcaconnect/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Logique métier (auth, orders, payments…)
│   │   ├── models/          # Sequelize (User, Order, Litige, Store…)
│   │   ├── routes/          # Routes Express
│   │   ├── services/        # escrow, payment, ai…
│   │   ├── middlewares/     # auth, validation
│   │   ├── migrations/      # SQL migrations
│   │   └── cron/            # rappels crédit
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/     # Landing BCA
│   │   │   ├── marketplace/ # TrustBar, etc.
│   │   │   ├── layout/      # Navbar, Sidebar, Footer
│   │   │   └── produits/    # ProductCard
│   │   ├── pages/           # Routes par rôle
│   │   ├── services/        # Appels API
│   │   ├── hooks/           # Data hooks
│   │   ├── store/           # Zustand (auth, cart…)
│   │   └── styles/          # design.css (tokens BCA)
│   └── .env.example
├── docker-compose.yml
└── Readme.md
```

### Flux API (développement local)

```
Frontend Vite (:5173 ou :3002)
    └── proxy /api → http://localhost:3000
Backend Express (:3000)
    ├── PostgreSQL (:5433 via Docker)
    └── Redis (:6379 via Docker)
```

> **Note :** Si vous voyez `http proxy error: /api/ping`, le backend n’est pas démarré. Lancez `npm run dev` dans `backend/`.

---

## Installation & démarrage

### Prérequis

- Node.js 18+
- PostgreSQL & Redis (ou Docker Compose)
- Clés API optionnelles : Groq, CinetPay

### 1. Backend

```bash
cd backend
cp .env.example .env    # Configurer DATABASE_URL, JWT, ENCRYPTION_KEY…
npm install
npm run dev             # Port 3000 par défaut
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# VITE_API_URL=http://localhost:3000/api
npm install
npm run dev             # Port 5173 (ou 3002 selon config)
```

### 3. Docker (stack complète)

```bash
docker-compose up --build
# Backend : http://localhost:5000
# Frontend : http://localhost (selon config nginx/vite)
# Postgres : localhost:5433
```

### Variables frontend (`.env.local`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## Tests & CI

```bash
# Backend
cd backend
npm test

# Validation globale API
node test-global-validation.js

# Frontend build
cd frontend
npm run build
```

---

## Déploiement production

Consultez le guide détaillé : **[`backend/DEPLOYMENT_PROD.md`](backend/DEPLOYMENT_PROD.md)**

Checklist rapide :

- [ ] HTTPS backend + frontend
- [ ] Variables CinetPay (`PAYMENT_API_KEY`, `PAYMENT_SITE_ID`, `PAYMENT_SECRET`)
- [ ] Webhook `{BACKEND_URL}/api/payments/webhook`
- [ ] Migration escrow/litiges au premier démarrage
- [ ] Redis pour refresh tokens
- [ ] Test paiement 1000 GNF avant lancement pilote

---

## Historique des livraisons récentes

Commit principal poussé sur `main` :

**`0cc55a0` — Fusion origin/main et livraison des évolutions BCA Connect**

Contenu de cette livraison :

- Landing page BCA complète (mega-menu, carousel, sidebar catégories, trust bar)
- Rebrand complet Alibaba → BCA (fichiers, constantes, CSS)
- Rôle technicien (backend + frontend + migration)
- Escrow bulletproof + workflow litiges avec remboursement auto
- Intégration CinetPay / Mobile Money production-ready
- Sécurisation API (validation globale, chiffrement, tests CI)
- Corrections proxy Vite et résilience landing (fallbacks API)
- Pages crédit (simulateur, calendrier, rappels cron)
- Logistique groupée et dashboard transporteur
- Assistant IA et tendances marché
- PWA, i18n (FR + langues locales), design tokens Framer Motion

---

## Contributeurs & licence

Projet **BCA Connect** — marketplace fintech Guinée.

Pour toute question technique : consulter `backend/API_DOCUMENTATION.md` et les tests dans `backend/tests/`.

---

*Dernière mise à jour : juin 2026*
