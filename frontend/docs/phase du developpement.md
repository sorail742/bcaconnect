# Phase 1 : Conception & Prototypage — Terminé ✅

> Aligné sur [`Readme.md`](../Readme.md) §13.1 et [`backend/phase du developpement.md`](../backend/phase%20du%20developpement.md)

## Frontend Phase 1

- [x] Catalogue public (`/marketplace`, `/product/:id`)
- [x] Panier & checkout réservés aux rôles **client** et **admin**
- [x] Bouton « Ajouter au panier » masqué si rôle non acheteur (`CAN_BUY`)
- [x] Wallet & historique transactions (`/wallet`)
- [x] Simulation paiement Mobile Money (`PaymentSimulation.jsx`)
- [x] Offline : file d'attente commandes COD + `mode_resilience`
- [x] PWA (vite-plugin-pwa, service worker en production)

## Phase 2 — Pilote (clôturée)

Voir [`backend/phase2 du developpement.md`](../backend/phase2%20du%20developpement.md).

## Prochaine étape

Phase 3 — Lancement officiel (PostgreSQL/Redis prod, export rapports, SMS, UAT).

*Dernière mise à jour : 7 juin 2026*
