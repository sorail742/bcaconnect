# Phase 1 : Conception & Prototypage — Terminé ✅

> **Référence cahier des charges :** [`Readme.md`](../Readme.md) §13.1  
> **Dernière validation :** 7 juin 2026

## Objectifs Phase 1 (Readme)

Prototype fonctionnel avec **catalogue**, **commandes** et **paiements**.

## Checklist livrée

### Fondations & base de données
- [x] Architecture globale (`backend/src/`, `frontend/src/`)
- [x] Schéma SQL Phase 1 (UUID, séquestre, split payment)
- [x] Node.js / Express 5 + Sequelize
- [x] Modèles MVP : User, Wallet, Store, Product, Category, Order, OrderItem, Transaction
- [x] Table `verifications_otp` (migration `20260609_verifications_otp.js`)

### Phase 1.1 — Authentification
- [x] Inscription & connexion JWT (RS256)
- [x] Middlewares protection & rôles (`authMiddleware`, `grantAccess`, `authorize`)
- [x] OTP inscription/paiement/retrait (`otpService`, `POST /auth/otp/*`)
- [x] Google OAuth, 2FA TOTP, refresh token rotation

### Phase 1.2 — CRUD Produits & Boutiques
- [x] CRUD produits fournisseur (ownership)
- [x] Gestion boutique (create/read/update)
- [x] Admin catégories
- [x] Catalogue public + recherche + fiche produit

### Prototype catalogue → commandes → paiements
- [x] Panier (Zustand) + checkout
- [x] RBAC passage commande (client + admin uniquement)
- [x] Paiement wallet + séquestre automatique
- [x] Paiement Mobile Money (simulation) — stock décrémenté à la confirmation
- [x] Paiement à la livraison (COD) + mode hors ligne (`mode_resilience`)
- [x] Journal transactions + historique wallet
- [x] Tests intégration Phase 1 (`tests/orders.test.js`)

## Tests

```bash
cd backend
npm run test:phase1      # Parcours Phase 1 (orders + auth + escrow)
npm run test:security    # Sécurité complète incl. orders
```

## Hors périmètre Phase 1 (→ Phase 2 Pilote)

GPS avancé, litiges interactifs, crédit banque, SAV/technicien, achats groupés, CinetPay production, PostgreSQL/Redis prod.

---

*Phase 2 clôturée — voir [`phase2 du developpement.md`](./phase2%20du%20developpement.md). Phase 3 = lancement officiel.*
