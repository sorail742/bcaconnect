# Audit fonctionnel — BCA Connect

> **Date :** 5 juin 2026  
> **Méthode :** revue des parcours utilisateur (frontend + backend), tests automatisés, analyse des flux métier  
> **Référence :** [`Readme.md`](./Readme.md) · [`STATUS_CONSOLIDE.md`](./STATUS_CONSOLIDE.md)

---

## 1. Verdict global

| Indicateur | Résultat |
|-----------|----------|
| **Parcours critiques opérationnels** | **11 / 15** (~73 %) |
| **Tests automatisés backend** | **14/14** ✅ (auth, escrow, litiges) |
| **Tests achats groupés** | Script présent — nécessite API démarrée |
| **Bloquants UX (navigation cassée)** | **4** confirmés |
| **Flux métier incomplets** | **6** (crédit→commande, group purchase paiement, avis, notifications UI…) |

**Conclusion :** la plateforme est **utilisable en démo pilote** pour les parcours client/fournisseur/transporteur/admin. Plusieurs parcours secondaires sont **cassés ou trompeurs** (banque, notifications, redirects post-checkout, avis produits).

---

## 2. Matrice des parcours fonctionnels

Légende : ✅ Fonctionnel · 🟡 Partiel (marche mais incomplet) · ❌ Cassé / absent

### 2.1 Parcours transversaux

| # | Parcours | Statut | Preuve / limite |
|---|----------|--------|-----------------|
| P1 | Inscription → login → redirection rôle | ✅ | `Register.jsx`, `Login.jsx`, `getDashboardRoute()` |
| P2 | Catalogue → fiche produit → panier | ✅ | `Catalogue`, `ProductDetails`, `cartStore` |
| P3 | Panier → checkout wallet → commandes | 🟡 | API OK · redirect wallet → `/dashboard/orders` **404** (`Checkout.jsx:103`) |
| P4 | Checkout mobile money (simulation) | ✅ | `capture-simulation` → `/orders` (`Checkout.jsx:186`) |
| P5 | Checkout hors ligne (COD) | 🟡 | `syncService` + queue · sync partielle catalogue |
| P6 | Suivi livraison GPS | ✅ | `/tracking`, Socket.IO, `deliveryController` |
| P7 | Signalement litige → résolution | ✅ | 14 tests Jest · workflow interactif |
| P8 | Déconnexion sécurisée | 🟡 | Logout **local only** — pas d'appel `POST /auth/logout` |
| P9 | Notifications in-app | ❌ | API OK · page UI champs incorrects (`title`/`read` vs `titre`/`est_lu`) |
| P10 | Laisser un avis produit | ❌ | `POST /reviews/create` existe · **aucune UI** |

### 2.2 Par rôle

| Rôle | Parcours principal | Statut | Bloquants |
|------|-------------------|--------|-----------|
| **Client** | Achat complet + SAV + crédit | 🟡 | Redirect checkout · Contact mort · avis absents |
| **Fournisseur** | Produits → commandes → litiges | 🟡 | Rapports hors menu · pub inaccessible (permission) |
| **Transporteur** | Missions → GPS → OTP → wallet | ✅ | OTP groupé = 1 code pour N commandes |
| **Banque** | Dashboard → crédits pending | 🟡 | **Pas de menu sidebar** · boutons dashboard morts |
| **Technicien** | Missions → complétion → wallet | 🟡 | Socket `io` vs `socketio` → wallet temps réel cassé |
| **Admin** | Supervision + logistique + litiges | ✅ | Returns absent du menu |

---

## 3. Détail par domaine fonctionnel

### 3.1 Authentification — ✅ / 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Login email/mot de passe | ✅ | Champ `mot_de_passe` |
| Google OAuth | ✅ | Auto-création client |
| 2FA TOTP | ✅ | Backend + profil |
| Refresh token rotation | ✅ | Redis |
| Logout serveur | ❌ | `authService.logout()` = `localStorage.removeItem` seulement |
| Inscription banque | ❌ | Rôle `banque` absent du register |

### 3.2 Marketplace & commandes — ✅ / 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Catalogue + recherche | ✅ | |
| Panier persistant | ✅ | Zustand + API |
| Création commande wallet | ✅ | Stock décrémenté, escrow activé |
| Devis livraison 3 tiers | ✅ | eco / standard / prioritaire |
| Commande MM en attente | 🟡 | Stock décrémenté avant paiement confirmé |
| Redirect post-commande wallet | ❌ | `/dashboard/orders` inexistant |
| Annulation commande | 🟡 | Owner peut annuler · message admin incohérent |

**Incohérence backend :** statut transaction `'terminé'` (`orderController.js:126`) vs `'complete'` ailleurs → stats/fraude faussées.

### 3.3 Paiements — 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Wallet + séquestre | ✅ | Testé Jest |
| CinetPay simulation | ✅ | `/payment/simulate/:id` |
| CinetPay production | ❌ | Clés API absentes |
| Webhook HMAC | 🟡 | Bypass si `PAYMENT_SECRET` vide (dev) |

### 3.4 Portefeuille — ✅ / 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Solde + historique | ✅ | |
| Transfert P2P | ✅ | Lock pessimiste |
| Recharge admin | 🟡 | Crédite l'appelant, pas de `user_id` cible |

### 3.5 Livraison & logistique — ✅ / 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Suivi public masqué RGPD | ✅ | `/delivery/track/:trackingNumber` |
| Acceptation mission transporteur | ✅ | |
| GPS temps réel | ✅ | Throttle 30s/50m |
| OTP → livraison → paiement transporteur | ✅ | `frais_port` → wallet |
| Livraisons groupées | 🟡 | **1 OTP** pour tout le groupe |
| Double libération escrow | ✅ | Séquestre libéré uniquement à l'OTP transporteur (`delivery/verify`) |
| Admin logistique carte flotte | ✅ | `/admin/logistics` |

### 3.6 Crédit & banque — 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Simulateur crédit | ✅ | Public + authentifié |
| Demande crédit + score IA | ✅ | |
| Approbation banque | 🟡 | Échéancier généré · **commande liée non payée** |
| Paiement échéance | 🟡 | **IDOR** : pas de vérif ownership échéance |
| Redirect post-demande | ❌ | `CreditSimulator.jsx:63` → `/credits` (404) |
| Dashboard banque transactions | 🟡 | Données OK · boutons Approve/Reject/AUDIT **sans handler** |
| Menu navigation banque | ❌ | Sidebar retombe sur menu **client** |
| Page crédits pending | ✅ | `/bank/credits` fonctionnelle |

### 3.7 Litiges — ✅

| Fonction | Statut | Détail |
|----------|--------|--------|
| Ouverture + preuves | ✅ | |
| Réponse défenseur | ✅ | |
| Acceptation proposition IA | ✅ | |
| Escalade admin | ✅ | |
| Résolution + remboursement escrow | ✅ | |
| Vérif ownership commande | ✅ | `createDispute` — partie prenante + défenseur lié à la commande |

### 3.8 Achats groupés — 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Création campagne | ✅ | |
| Participation (join) | 🟡 | **Sans débit wallet** |
| Clôture → commandes | 🟡 | `en_attente_paiement` · pas de stock · port fixe 15 000 GNF |
| UI complète | ✅ | `/group-purchase` |
| Navigation sidebar | ❌ | Aucun rôle n'a le lien (hors URL directe) |

### 3.9 SAV & technicien — ✅ / 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Liste garanties client | ✅ | |
| Demande intervention | 🟡 | Requiert `?product=` en query |
| Suivi interventions client | ✅ | Lecture seule |
| Acceptation mission technicien | ✅ | |
| Complétion + crédit wallet | 🟡 | API OK · socket `req.app.get('io')` **incorrect** (`socketio` attendu) |
| Noms produits équipements | 🟡 | Alias Sequelize probablement incorrect |

### 3.10 Notifications — ❌ (UI) / ✅ (API)

| Fonction | Statut | Détail |
|----------|--------|--------|
| `GET /notifications` | ✅ | |
| Mark read / delete API | ✅ | Services frontend existent |
| Page `/notifications` | ❌ | Utilise `title`/`read` au lieu de `titre`/`est_lu` |
| Filtres par type | ❌ | UI : `alert, info, success` · backend : `dispute, delivery, sav…` |
| Bouton supprimer | ❌ | Pas de `onClick` |
| Badge header | ✅ | `DashboardLayout` utilise `est_lu` correctement |

### 3.11 Avis produits — ❌

| Fonction | Statut | Détail |
|----------|--------|--------|
| Affichage avis embarqués | ✅ | `ProductDetails`, `ProductCard` |
| Soumission avis post-achat | ❌ | `POST /reviews/create` jamais appelé |
| Anti-doublon / commande livrée | ❌ | Non vérifié backend |

### 3.12 Publicités — 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Affichage carousel | ✅ | `GET /ads` |
| CRUD admin | ✅ | `AdManager.jsx` |
| CRUD fournisseur | ❌ | Lien sidebar caché (`manage_ads` manquant pour fournisseur) |
| RBAC création pub | ❌ | Tout user authentifié peut `POST /ads` |
| `GET /ads/:id` | ❌ | `adService.getById` → 404 |

### 3.13 Éducation — 🟡

| Fonction | Statut | Détail |
|----------|--------|--------|
| Page EducationCenter | 🟡 | Fallback **mock hardcodé** si DB vide |
| CRUD admin contenu | ❌ | |

---

## 4. Bloquants fonctionnels (P0)

| # | Problème | Statut | Correction |
|---|----------|--------|------------|
| B1 | Redirect checkout wallet → `/dashboard/orders` | ✅ Corrigé | `Checkout.jsx` → `/orders` |
| B2 | Sidebar banque absente | ✅ Corrigé | Menu `banque` dans `Sidebar.jsx` |
| B3 | Notifications UI champs incorrects | ✅ Corrigé | `titre`/`est_lu` + actions mark-read/delete |
| B4 | Redirect crédit → `/credits` | ✅ Corrigé | `CreditSimulator.jsx` → `/dashboard/credits` |
| B5 | Bouton Contact commandes mort | ✅ Corrigé | `OrdersClient.jsx` → `/messages?recipient=...` |

---

## 5. Défauts majeurs (P1)

| # | Problème | Statut | Domaine |
|---|----------|--------|---------|
| M1 | Approbation crédit ne finance pas la commande liée | ✅ Corrigé | `creditController.approveCredit` → escrow + commande `payé` |
| M2 | Achats groupés : join sans paiement, close sans stock | ✅ Corrigé | Wallet + stock + séquestre |
| M3 | Aucune UI soumission avis | ✅ Corrigé | `ReviewForm` + API eligible |
| M4 | BankDashboard boutons Approve/Reject/AUDIT morts | ✅ Corrigé | Liens Crédits / Détails |
| M5 | Logout ne révoque pas refresh token serveur | ✅ Corrigé | `authService.logout` + `optionalAuth` sur `/auth/logout` |
| M6 | `payInstallment` IDOR possible | ✅ Corrigé | Vérif ownership `Credit.utilisateur_id` |
| M7 | Technician socket key `io` vs `socketio` | ✅ Corrigé | `technicianController.js` |
| M8 | Statut transaction `terminé` vs `complete` | ✅ Corrigé | `orderController.js` → `complete` |
| M9 | Double libération escrow (vendor + carrier) | ✅ Corrigé | Escrow uniquement via OTP transporteur |
| M10 | Bouton Contact commandes sans action | ✅ Corrigé | Sprint 1 |

---

## 6. Défauts mineurs (P2)

- Recherche sidebar décorative (pas de handler)
- `/vendor/reports` hors navigation
- `/admin/returns` hors sidebar admin
- `MaintenanceRequest` échoue silencieusement sans `?product=`
- AdBanner n'utilise pas `/ads/serve` (ciblage rôle)
- Cron rappels crédit : alias User incorrect + notifications console-only
- Pages ComingSoon : `/careers`, `/consultant`, `/blog`, `/investors`

---

## 7. Scénarios de test manuel recommandés

### Scénario A — Client achat wallet (🔴 bloqué en fin de parcours)

```
1. seed:accounts → client@test.com
2. Marketplace → ajouter au panier → checkout
3. Payer par wallet
4. ATTENDU : /orders avec commande visible
5. RÉEL : redirect /dashboard/orders → 404
```

### Scénario B — Transporteur livraison complète (✅)

```
1. seed:carrier-demo + fournisseur marque commande pret
2. transporteur@test.com → /carrier/dashboard
3. Accepter mission → activer GPS → saisir OTP client
4. Vérifier wallet transporteur crédité (frais_port)
```

### Scénario C — Banque crédit (🟡)

```
1. seed:pending-credits
2. banque@test.com → naviguer manuellement /bank/credits
3. Approuver une demande → OK échéancier
4. Vérifier : commande liée reste non payée
```

### Scénario D — Litige complet (✅)

```
1. Client ouvre litige sur commande livrée
2. Fournisseur répond → client accepte ou escalade
3. Admin résout → escrow remboursé
```

### Scénario E — Notifications (🔴)

```
1. Déclencher une notif (commande, livraison…)
2. Header : badge correct (est_lu)
3. /notifications : titres vides, tout "non lu", filtres vides
```

### Scénario F — SAV technicien (🟡)

```
1. seed:guarantees + seed:technician
2. Client : /sav/guarantees → demande maintenance
3. Technicien : accepter → compléter
4. Wallet crédité (API) mais pas de push temps réel
```

---

## 8. Score fonctionnel par domaine

```
Auth & sessions          ████████████████░░░░  80%
Marketplace & commandes  ████████████████░░░░  82%
Paiements & wallet       ██████████████░░░░░░  72%
Livraison & GPS          █████████████████░░░  86%
Crédit & banque          ████████████░░░░░░░░  62%
Litiges                  ██████████████████░░  92%
Achats groupés           ██████████████░░░░░░  70%
SAV & technicien         ███████████████░░░░░  76%
Notifications (UX)       ████░░░░░░░░░░░░░░░░  20%
Avis produits            ██░░░░░░░░░░░░░░░░░░  10%
Publicités               ██████████░░░░░░░░░░  52%
Éducation                ████████░░░░░░░░░░░░  40%
```

**Score global fonctionnel estimé : ~72 %**

---

## 9. Plan de remédiation (ordre recommandé)

### Sprint 1 — Débloquer les parcours (1–2 jours)

1. Fix redirects : `Checkout.jsx:103`, `CreditSimulator.jsx:63`
2. Menu sidebar `banque`
3. Fix `Notifications.jsx` (champs + actions)
4. Wire bouton Contact → `/messages`

### Sprint 2 — Intégrité métier (3–5 jours)

5. `approveCredit` → activer paiement commande liée
6. `payInstallment` → vérifier ownership
7. Fix socket technicien `socketio`
8. Harmoniser statuts `terminé` / `complete`
9. Logout → appeler `POST /auth/logout`

### Sprint 3 — Compléter l'expérience (1 semaine)

10. UI avis produits (`POST /reviews/create`)
11. Achats groupés : paiement à l'engagement + stock à la clôture
12. RBAC ads + route `/vendor/ads`
13. Liens sidebar : group-purchase, vendor reports, admin returns

---

## 10. Tests automatisés exécutés

| Suite | Résultat | Date audit |
|-------|----------|------------|
| `npm run test:security` | **14/14 passed** | 5 juin 2026 |
| `scripts/test-group-purchases.js` | Non exécuté (API port 5000 down) | — |

---

*Document généré par audit code + tests. À mettre à jour après chaque sprint de correction.*
