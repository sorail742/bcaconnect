# Phase 2 : Développement Pilote — Terminé ✅

> **Référence cahier des charges :** [`Readme.md`](../Readme.md) §13.2  
> **Dernière validation :** 7 juin 2026

## Objectifs Phase 2 (Readme)

Version bêta avec fonctionnalités principales, testable en environnement pilote contrôlé.

## Modules livrés

### Logistique & livraison
- [x] 3 tiers livraison (éco / standard / prioritaire) — `shippingService.js`
- [x] Suivi GPS transporteur + OTP livraison
- [x] Livraisons groupées
- [x] Dashboard admin logistique (`/admin/logistics`)
- [x] Paiement wallet transporteur à l'OTP

### Litiges
- [x] Workflow interactif (réponse, escalade, acceptation proposition)
- [x] Médiation IA backend
- [x] Événements litige (`LitigeEvenement`)
- [x] Tests Jest 14/14

### Crédit & banque
- [x] Simulateur + demande crédit
- [x] Approbation/rejet banque → active commande liée + séquestre
- [x] Page `/bank/credits`
- [x] Rappels échéances cron → notifications in-app (`type: credit`)
- [x] Protection IDOR paiement échéances

### Achats groupés (ONG/B2B)
- [x] Module complet backend + frontend
- [x] Paiement wallet à l'engagement, stock + séquestre à la clôture
- [x] Tests script 22/22

### SAV & technicien
- [x] Garanties, interventions client, missions technicien
- [x] Notifications socket missions
- [x] UX maintenance : alerte si produit non sélectionné

### Paiements & wallet
- [x] CinetPay v2 simulation + staging doc (`DEPLOYMENT_STAGING.md`)
- [x] Webhook HMAC testé
- [x] Stock MM différé jusqu'à confirmation paiement
- [ ] CinetPay production — **bloqué clés API marchand** (externe)

### Expérience utilisateur
- [x] Avis produits (`ReviewForm` + eligible)
- [x] Notifications UI corrigée (titre/est_lu, delete)
- [x] Publicités fournisseur `/vendor/ads` + `GET /ads/:id`
- [x] Éducation admin CRUD + seed
- [x] Offline COD + `mode_resilience`
- [x] PWA (vite-plugin-pwa)

### Tests automatisés Phase 2

| Suite | Résultat |
|-------|----------|
| `npm run test:security` | 24/24 |
| `npm run test:phase1` | 16/16 |
| `scripts/test-group-purchases.js` | 22/22 |
| `scripts/api-smoke-test.mjs` | 7/7 |
| `scripts/browser-smoke-test.mjs` | 20/20 (doc) |

```bash
cd backend && npm run test:security
API_URL=http://localhost:5001/api node scripts/test-group-purchases.js
node ../scripts/api-smoke-test.mjs
```

## Hors périmètre Phase 2 (→ Phase 3)

- PostgreSQL + Redis production déployés
- Export PDF/Excel rapports
- SMS rappels crédit (in-app OK, SMS = Phase 3)
- CinetPay clés production
- Documentation UAT formalisée
- IoT, blockchain, ERP, USSD

## Écarts externes documentés

| Item | Statut | Action requise |
|------|--------|----------------|
| CinetPay prod | Staging prêt | Clés API + ngrok |
| Infra prod | Docker compose local | Déploiement Phase 3 |

---

*Phase 3 = lancement officiel à grande échelle.*
