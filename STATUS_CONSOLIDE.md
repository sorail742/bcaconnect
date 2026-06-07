# BCA Connect — État consolidé du projet

> **Dernière mise à jour :** 6 juin 2026  
> **Référence cahier des charges :** [`Readme.md`](./Readme.md)  
> **Phase atteinte :** Fin Phase 1 / début Phase 2 (Pilote beta)

Ce document consolide **tout le travail réalisé** sur BCA Connect : modules livrés, routes, API, seeds, tests, corrections et écarts restants par rapport au Readme.

---

## 1. Synthèse

| Indicateur | Valeur |
|-----------|--------|
| Couverture globale (Phase 2 Pilote) | **~75 %** |
| Backend API | **~90 %** — 24 modules de routes |
| Frontend UI | **~88 %** — 6 rôles opérationnels |
| Tests automatisés | **14** Jest + **22** achats groupés + **20** navigateur + **7** API smoke |
| Paiements prod | **Simulation** — CinetPay en attente de clés API |

**Verdict :** plateforme pilote fonctionnelle de bout en bout (catalogue → commande → paiement/séquestre → livraison GPS → litige → crédit → SAV). Pas encore prête pour un lancement national.

---

## 2. Stack & démarrage local

| Composant | Technologie | Port |
|-----------|-------------|------|
| Frontend | React 18 + Vite + Tailwind + shadcn | **3002** |
| Backend | Express 5 + Sequelize | **5000** (ou **5001** si 5000 occupé) |
| Base de données | SQLite (`backend/src/data/database.sqlite`) | — |
| Temps réel | Socket.IO | même port que l'API |
| Offline | Dexie (IndexedDB) + `syncService` | — |
| Cartes | Leaflet | — |

### Démarrage

```bash
# Terminal 1 — Backend (sans Redis local si non installé)
cd backend
env -u REDIS_URL PORT=5001 npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

> Si `REDIS_URL` est défini dans `.env` mais Redis n'est pas lancé, le backend bloque au démarrage. Utiliser `env -u REDIS_URL` ou démarrer Redis sur `localhost:6379`.

Si le port 5000 est bloqué : `bash scripts/free-ports.sh` ou utiliser `PORT=5001` et mettre à jour `frontend/.env.local` :

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Comptes de test

```bash
cd backend && npm run seed:accounts
```

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@test.com` | `Admin@123` |
| Client | `client@test.com` | `Client@123` |
| Fournisseur | `fournisseur@test.com` | `Fournisseur@123` |
| Transporteur | `transporteur@test.com` | `Transport@123` |
| Banque | `banque@test.com` | `Banque@123` |
| Technicien | `technicien@test.com` | `Technicien@123` |

> L'API login attend le champ `mot_de_passe` (pas `password`).

---

## 3. Modules livrés (par domaine)

### 3.1 Marketplace & catalogue ✅

- Catalogue public `/marketplace`, fiche produit, recherche, panier
- Gestion produits fournisseur (CRUD, stocks)
- Admin : produits, catégories, publicités
- Script restauration stocks : `npm run restore:stock`

### 3.2 Commandes & checkout ✅

- Parcours panier → checkout → commande
- Modes de livraison : **économique / standard / prioritaire**
- Paiements : wallet, mobile money (CinetPay v2), COD
- Séquestre automatique (fonds bloqués jusqu'à OTP livraison)
- Checkout hors ligne : COD uniquement + file de sync

**Fichiers clés :** `Checkout.jsx`, `orderController.js`, `shippingService.js`

### 3.3 Portefeuille & paiements 🟡

- Wallet : recharge, transfert, historique, séquestre
- CinetPay : intégration v2 + page simulation dev
- **Prod bloquée** sans clés API → voir [`backend/DEPLOYMENT_PROD.md`](./backend/DEPLOYMENT_PROD.md)
- `PAYMENT_MODE=simulation` par défaut

### 3.4 Crédit & banque ✅

- Simulateur crédit + score IA
- Calendrier échéances + cron rappels (`creditReminderCron`)
- Workflow banque : approbation / rejet des demandes
- Pages : `BankDashboard`, `BankCredits`, `MyCredits`, `CreditSimulator`

**API :**
- `GET /api/credits/pending`
- `PUT /api/credits/:id/approve`
- `PUT /api/credits/:id/reject`

**Seed :** `npm run seed:pending-credits`

### 3.5 Logistique & GPS ✅

- Suivi GPS client (`/tracking`)
- Dashboard transporteur : missions, historique, GPS throttlé (30s/50m), polyline Leaflet
- OTP livraison → paiement transporteur (`frais_port` → wallet)
- Livraisons groupées + calcul CO₂
- Dashboard admin logistique : carte flotte, KPIs (`/admin/logistics`)

**API :**
- `GET /api/delivery/completed`
- `GET /api/delivery/admin/overview`
- Notifications transporteurs quand commande `pret`

**Seed :** `npm run seed:carrier-demo`

### 3.6 Litiges ✅

- Signalement, workflow interactif (réponse, escalade, proposition)
- Médiation IA (backend)
- Pages client + admin
- **14/14 tests** Jest

**Migration :** `20260607_litige_evenements.js`

### 3.7 Achats groupés (ONG/B2B) ✅

- Création campagne, participation, seuil, clôture
- Page `/group-purchase`
- **20/20** tests script manuel

**Migration :** `20260606_achats_groupes.js`  
**Seed :** `npm run seed:group-purchases`

### 3.8 SAV & technicien ✅

- Garanties client (`/sav/guarantees`)
- Demandes maintenance (`/sav/maintenance/new`)
- Interventions client (`/sav/interventions`)
- Dashboard technicien : missions, équipements, wallet mission
- Notifications socket `sav_mission_available`

**Seeds :** `npm run seed:guarantees`, `npm run seed:technician`

### 3.9 Offline-first 🟡 (~55 %)

- IndexedDB Dexie (`frontend/src/lib/db.js`)
- File d'attente sync (`syncService.js`)
- Bannière offline (`OfflineBanner.jsx`)
- Init dans `main.jsx`
- Manque : PWA install prompt, cache catalogue complet

### 3.10 Admin & analytics 🟡

- 11 modules admin (users, produits, transactions, litiges, finances, logistique, trends IA…)
- Rapports fournisseur
- Manque : export PDF/Excel, rapports périodiques auto

### 3.11 Éducation & support 🟡

- `EducationCenter`, FAQ, Help, Messages, tickets support
- Contenu éducation = fallback mock si DB vide

### 3.12 Non implémenté (Phase 4)

- IoT (stub backend `/api/iot`)
- Blockchain / crypto
- ERP (SAP/Odoo)
- USSD / SMS rural
- Multilingue complet (Soussou, Peul…)
- Tests E2E frontend (Playwright)

---

## 4. État par rôle

| Rôle | Routes principales | Sidebar | Complétude |
|------|-------------------|---------|------------|
| **Client** | `/dashboard`, `/orders`, `/wallet`, `/sav/*`, litiges, crédit, achats groupés | ✅ | ~92 % |
| **Fournisseur** | `/vendor/*` | ✅ | ~88 % |
| **Admin** | `/admin/*` (11 modules + logistique) | ✅ | ~90 % |
| **Transporteur** | `/carrier/dashboard` | ✅ | ~88 % |
| **Banque** | `/bank/dashboard`, `/bank/credits` | ✅ (corrigé) | ~75 % |
| **Technicien** | `/technician/*` | ✅ | ~85 % |

---

## 5. API — modules montés

Préfixe : `/api`

| Module | Route |
|--------|-------|
| Auth | `/auth` |
| Utilisateurs | `/users` |
| Produits | `/products` |
| Commandes | `/orders` |
| Paiements | `/payments` |
| Portefeuille | `/wallet` |
| Livraison | `/delivery` |
| Litiges | `/disputes` |
| Crédits | `/credits` |
| Achats groupés | `/group-purchases` |
| SAV | `/sav` |
| Technicien | `/technician` |
| Messages | `/messages` |
| Notifications | `/notifications` |
| Avis | `/reviews` |
| Publicités | `/ads` |
| Éducation | `/education` |
| IA | `/ai` |
| Stats | `/stats` |
| IoT (stub) | `/iot` |

---

## 6. Scripts seed & maintenance

Exécuter depuis `backend/` :

| Script | Commande | Usage |
|--------|----------|-------|
| Comptes test | `npm run seed:accounts` | 6 rôles |
| Achats groupés | `npm run seed:group-purchases` | Campagnes démo |
| Crédits en attente | `npm run seed:pending-credits` | Workflow banque |
| Livraisons transporteur | `npm run seed:carrier-demo` | Missions + historique |
| Garanties SAV | `npm run seed:guarantees` | 3 garanties client |
| Technicien | `npm run seed:technician` | Missions SAV |
| Éducation | `npm run seed:education` | 8 ressources BCA Academy |
| Recharge wallets | `npm run seed:recharge-wallets` | 5M GNF sur comptes test (achats groupés) |
| Stocks | `npm run restore:stock` | Restaure quantités produits |

---

## 7. Tests

```bash
cd backend
npm run seed:recharge-wallets          # prérequis achats groupés
npm run test:security                  # 19/19 : auth, escrow, litiges, HMAC
API_URL=http://localhost:5001/api node scripts/test-group-purchases.js   # 22/22

cd ..
node scripts/browser-smoke-test.mjs    # 20/20 Playwright (Chromium)
node scripts/api-smoke-test.mjs        # 7/7 endpoints critiques
npm run test:payment                   # flux paiement (simulation ou live)
```

**Dernier run (6 juin 2026) :** 14 + 22 + 20 + 7 = **63/63** ✅

---

## 8. Migrations récentes

| Fichier | Contenu |
|---------|---------|
| `20260602_escrow_and_disputes.js` | Séquestre + litiges |
| `20260605_schema_columns.js` | Colonnes schéma |
| `20260606_achats_groupes.js` | Tables achats groupés |
| `20260607_litige_evenements.js` | Événements litige |
| `20260608_order_delivery_type.js` | Type livraison commande |
| `20231201_add_technicien_fields.js` | Champs technicien |

---

## 9. Fichiers clés créés ou modifiés (sessions récentes)

### Backend

```
src/controllers/deliveryController.js   — GPS, overview admin, paiement transporteur
src/controllers/creditController.js       — approve/reject banque
src/controllers/savController.js          — missions SAV + socket
src/controllers/disputeController.js      — workflow interactif
src/controllers/groupPurchaseController.js
src/controllers/orderController.js
src/routes/deliveryRoutes.js, creditRoutes.js, groupPurchaseRoutes.js
src/models/Notification.js                  — types sav, delivery
scripts/seed-pending-credits.js
scripts/seed-carrier-demo.js
scripts/seed-guarantees.js
scripts/seed-technician-demo.js
```

### Frontend

```
src/services/syncService.js               — offline queue
src/components/layout/OfflineBanner.jsx
src/pages/Checkout.jsx
src/pages/admin/AdminLogistics.jsx
src/pages/carrier/CarrierDashboard.jsx
src/pages/bank/BankCredits.jsx, BankDashboard.jsx
src/pages/sav/MyGuarantees.jsx, MyInterventions.jsx, MaintenanceRequest.jsx
src/pages/technician/*                    — dashboard, missions, équipements
src/pages/GroupPurchase.jsx
src/hooks/data/useCarrierData.js, useSavData.js, useCreditData.js, useTechnicianData.js
src/components/layout/Sidebar.jsx         — menus par rôle
src/hooks/useRBAC.js                      — aligné backend
```

---

## 10. Corrections appliquées (consolidation 5 juin 2026)

| # | Problème | Correction |
|---|----------|------------|
| 1 | Checkout wallet → `/dashboard/orders` (404) | Redirige vers `/orders` |
| 2 | Rôle banque sans menu sidebar | Menu banque ajouté (dashboard, crédits, finances) |
| 3 | RBAC frontend incomplet | `banque` + `technicien` ajoutés dans `useRBAC.js` |
| 4 | Achats groupés permissions frontend | `CAN_ACCESS_GROUP_PURCHASE` aligné sur les rôles AppRoutes |
| 5 | Achats groupés invisible client | Lien sidebar client ajouté |
| 6 | Messages `loadConversations` | Remplacé par `refetchConversations` |
| 7 | Admin logistique overflow KPI | Layout corrigé (`min-w-0`, `DashboardCard`) |
| 8 | Notifications UI champs incorrects | `titre`/`est_lu` + mark-read/delete branchés |
| 9 | Redirect crédit → `/credits` (404) | `CreditSimulator.jsx` → `/dashboard/credits` |
| 10 | Contact commandes sans action | `OrdersClient.jsx` → `/messages?recipient=` |
| 11 | Approbation crédit sans commande payée | `creditController.approveCredit` active escrow |
| 12 | `payInstallment` IDOR | Vérif ownership crédit |
| 13 | Logout sans révocation serveur | `POST /auth/logout` + `optionalAuth` |
| 14 | Achats groupés sans wallet/stock | Join/leave wallet + close avec séquestre |
| 15 | UI avis produits absente | `ReviewForm.jsx` + `GET /reviews/eligible` |
| 16 | Ads fournisseur via admin | `/vendor/ads` + `GET /ads?mine=1` |
| 17 | Double libération escrow | Séquestre libéré uniquement à l'OTP transporteur |
| 18 | `createDispute` IDOR | Vérif partie prenante + défenseur lié à la commande |

---

## 11. Écarts restants vs Readme

### P0 — Avant pilote utilisateurs

- [ ] CinetPay prod (clés API marchand) — staging prêt : voir [`DEPLOYMENT_STAGING.md`](./DEPLOYMENT_STAGING.md)
- [x] Tests E2E parcours client (Playwright) — `scripts/browser-smoke-test.mjs` 20/20
- [x] UI soumission avis produits — `ReviewForm` sur fiche produit

### P1 — Consolidation pilote

- [x] Notifications : delete/mark-read branchés
- [x] Route ads dédiée fournisseur — `/vendor/ads`
- [x] Seed contenu éducation réel + CRUD admin — `/admin/education` + `seed:education`
- [x] CI `npm run test:security` (17 tests incl. HMAC paiement) — smoke Playwright optionnel

### P2 — Lancement (Phase 3)

- [ ] PostgreSQL + Redis prod
- [ ] Export rapports PDF/Excel
- [ ] SMS rappels crédit
- [ ] Documentation UAT formalisée

### P3 — Évolutivité (Phase 4)

- [ ] IoT, blockchain, crypto, ERP, USSD, ML géolocalisé

---

## 12. Score de couverture Readme

```
Catalogue & commandes     ████████████████████  92%
Paiements & wallet        ████████████████░░░░  80%
Crédit & banque           █████████████████░░░  85%
Logistique & GPS          █████████████████░░░  88%
Litiges                   ██████████████████░░  90%
SAV & technicien          █████████████████░░░  85%
Achats groupés ONG        █████████████████░░░  88%
Offline / PWA             ███████████░░░░░░░░░  55%
Analytics & rapports      ██████████████░░░░░░  70%
Éducation                 ██████████░░░░░░░░░░  50%
Sécurité & infra prod     ████████░░░░░░░░░░░░  40%
IoT / blockchain / crypto ░░░░░░░░░░░░░░░░░░░░   5%
```

---

## 13. Parcours de démo recommandé

1. **Client** : marketplace → panier → checkout (wallet ou MM simulé) → `/orders` → `/tracking`
2. **Fournisseur** : valider commande → marquer `pret`
3. **Transporteur** : accepter mission → GPS → OTP livraison → vérifier wallet
4. **Banque** : `/bank/credits` → approuver une demande (`seed:pending-credits`)
5. **Client SAV** : `/sav/guarantees` → demande maintenance (`seed:guarantees`)
6. **Technicien** : accepter mission → compléter → wallet crédité
7. **Admin** : `/admin/logistics` + `/admin/disputes`
8. **Hors ligne** : couper réseau → checkout COD → reconnecter → sync

---

## 14. Documents connexes

| Document | Contenu |
|----------|---------|
| [`Readme.md`](./Readme.md) | Cahier des charges complet |
| [`RBAC_MATRIX.md`](./RBAC_MATRIX.md) | Matrice permissions |
| [`DEPLOYMENT_STAGING.md`](./DEPLOYMENT_STAGING.md) | Staging CinetPay + tunnel HTTPS |
| [`backend/DEPLOYMENT_PROD.md`](./backend/DEPLOYMENT_PROD.md) | Déploiement CinetPay prod |
| [`backend/API_DOCUMENTATION.md`](./backend/API_DOCUMENTATION.md) | Référence API |
| [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) | Journal de bord historique |
| [`audit_report.md`](./audit_report.md) | Audit technique antérieur |

---

*Ce fichier est la source de vérité pour l'état actuel du projet. Mettre à jour à chaque livraison majeure.*
