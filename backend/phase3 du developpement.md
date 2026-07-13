# Phase 3 : Lancement officiel — En cours 🚀

> **Référence cahier des charges :** [`Readme.md`](../Readme.md) §13  
> **Démarrage :** 7 juin 2026 — après commit `9fece84` (Phases 1+2 clôturées)

## Objectifs Phase 3

Passage du pilote bêta à un déploiement production-ready : base PostgreSQL, cache Redis, exports auditables, notifications SMS, paiements CinetPay live, UAT formalisée.

---

## Checklist Phase 3

### Infrastructure production

- [x] `docker-compose.yml` — Postgres 15 + Redis 7 + backend + frontend
- [x] Script `scripts/docker-dev.sh` — démarrage infra locale (db + redis)
- [x] Script `backend/scripts/verify-postgres.js` — test connexion + migrations
- [x] `backend/.env.docker.example` — variables pour dev Postgres local
- [ ] Déploiement staging/prod documenté (`DEPLOYMENT_PROD.md`)
- [ ] CI avec job Postgres (smoke migrations)

### Export rapports admin

- [x] Export Excel / CSV / PDF — `frontend/src/pages/admin/FinancialReports.jsx`
- [ ] Export rapports fournisseur (revenus, commandes)
- [ ] Export litiges / crédits pour audit banque

### Notifications SMS

- [x] Service `smsService.js` — providers `console` et `http` (webhook)
- [x] Intégration cron crédit — SMS parallèle aux notifications in-app
- [ ] Provider SMS production (Africa's Talking, Twilio, Orange API)
- [ ] Préférences utilisateur (opt-in SMS)

### Paiements CinetPay production

- [x] Simulation + staging (`DEPLOYMENT_STAGING.md`, `test-cinetpay-staging.js`)
- [ ] Clés API marchand production
- [ ] Webhook HTTPS validé en prod
- [ ] `PAYMENT_MODE=live` testé bout-en-bout

### Qualité & UAT

- [x] CI : `test:security` (24 tests)
- [x] CI : `test:phase1` ajouté
- [ ] Playwright smoke en CI (optionnel)
- [ ] Plan UAT formalisé (`docs/UAT_PLAN.md`)
- [ ] Scénarios UAT par rôle (client, fournisseur, banque, transporteur, technicien)

### Hors périmètre Phase 3 (→ Phase 4)

- IoT capteurs, blockchain, crypto, ERP, USSD, ML géolocalisé

---

## Dépannage Postgres / Docker

### `permission denied` sur docker.sock

```bash
sudo usermod -aG docker "$USER"
newgrp docker          # ou session déconnectée / reconnectée
sudo systemctl start docker
./scripts/docker-dev.sh
```

Alternative temporaire : `sudo docker compose up -d db redis`

### `password authentication failed for user "bca_user"`

Docker n'a pas créé la base — un **autre** Postgres répond sur le port 5433.

```bash
# Reset volume docker (si docker accessible)
docker compose down -v
./scripts/docker-dev.sh
npm run verify:postgres
```

### Continuer sans Postgres (dev rapide)

```bash
./scripts/dev-backend.sh
# équivalent :
cd backend && env -u DATABASE_URL USE_LOCAL_DB=true PORT=5001 npm run dev
```

Si `DATABASE_URL` est dans `backend/.env`, le retirer ou commenter la ligne, sinon dotenv peut forcer Postgres au redémarrage.

---

## Démarrage rapide — Postgres local

```bash
# 1. Infra Docker (db + redis uniquement)
./scripts/docker-dev.sh

# 2. Vérifier connexion + migrations
cd backend
export DATABASE_URL=postgresql://bca_user:bca_password@localhost:5433/bcaconnect
export REDIS_URL=redis://localhost:6379
npm run verify:postgres

# 3. Backend avec Postgres (copier .env.docker.example → .env)
PORT=5001 npm run dev

# 4. Frontend (inchangé)
cd ../frontend && npm run dev
```

Stack complète Docker (backend + frontend conteneurisés) :

```bash
docker compose up --build
```

---

## SMS (Phase 3)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SMS_ENABLED` | Active l'envoi SMS | `false` |
| `SMS_PROVIDER` | `console` ou `http` | `console` |
| `SMS_WEBHOOK_URL` | URL webhook gateway SMS | — |
| `SMS_SENDER_ID` | Expéditeur (max 11 car.) | `BCAConnect` |

En dev : `SMS_ENABLED=true SMS_PROVIDER=console` — les SMS s'affichent dans les logs.

---

## Tests Phase 3

```bash
cd backend
npm run test:security      # 24/24
npm run test:phase1        # 16/16
npm run test:phase2        # security + achats groupés
npm run verify:postgres    # si DATABASE_URL Postgres défini
```

---

## Prochaines priorités

1. Valider migrations sur Postgres (toutes les tables Phase 1+2)
2. Document UAT + scénarios par rôle
3. Intégration provider SMS réel (clés externe)
4. CinetPay live avec clés marchand
5. Playwright en CI

---

*Phase 3 = lancement officiel à grande échelle.*
