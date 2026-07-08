# Guide développement — équipe (2 développeurs)

> Chaque développeur a **son propre poste**, sa **propre base locale** et son **`.env` non versionné**.  
> Le dépôt Git est le seul point de synchronisation du code.

---

## Principe

| Élément | Partagé (Git) | Local (chaque dev) |
|---------|---------------|---------------------|
| Code source | ✅ | — |
| Migrations SQL | ✅ | — |
| `backend/.env.example` | ✅ | copier → `.env` |
| `frontend/.env.example` | ✅ | copier → `.env.local` |
| `backend/.env` | ❌ jamais | ✅ |
| Base SQLite `backend/data/` | ❌ jamais | ✅ |
| Docker / Postgres | optionnel | ✅ selon la machine |

**Postgres n'est pas requis au quotidien.** SQLite suffit pour développer Phases 1–2 et la plupart de la Phase 3.

---

## Installation (identique pour les 2 devs)

```bash
git clone <repo> && cd bcaconnect

# Backend
cd backend
cp .env.example .env
# Éditer .env : JWT keys, GROQ_API_KEY (demander à l'autre dev ou regénérer)
npm install
npm run seed:accounts    # comptes test (client@test.com / Client@123, etc.)

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

---

## Démarrage quotidien (recommandé)

**Terminal 1 — backend :**
```bash
cd bcaconnect
./scripts/dev-backend.sh
```
→ SQLite automatique si Docker indisponible. Port **5001**.

**Terminal 2 — frontend :**
```bash
cd frontend && npm run dev
```
→ http://localhost:3002

**Avant de coder :** `git pull` pour récupérer le travail de l'autre.

---

## Ports standard (équipe)

| Service | Port |
|---------|------|
| Frontend Vite | 3002 |
| Backend API | **5001** |
| Postgres Docker (optionnel) | 5433 |
| Redis Docker (optionnel) | 6379 |

Si un port est occupé : `./scripts/free-ports.sh`

---

## Variables `.env` — ne pas diverger

Chaque dev garde son `.env` local, mais **mêmes noms de variables** :

- **SQLite (défaut)** : ne pas définir `DATABASE_URL`, ou `USE_LOCAL_DB=true`
- **Redis local sans Docker** : retirer `REDIS_URL` du `.env` si Redis n'est pas installé (le backend démarre quand même)
- **JWT** : chaque machine peut avoir ses propres clés RSA en dev — les tokens ne sont pas partagés entre postes

Demander à l'autre dev les clés **partagées** (Groq, Google OAuth, CinetPay staging) par canal sécurisé, jamais via Git.

---

## Workflow Git (2 personnes)

1. `git pull origin main` (ou `develop`) avant chaque session
2. Travailler sur une branche ou un module distinct si possible (ex. Dev A = backend Phase 3, Dev B = frontend UAT)
3. Commits petits et descriptifs
4. Mettre à jour `DEVELOPMENT_LOG.md` en fin de session (qui a fait quoi)
5. Ne **jamais** committer : `.env`, `database.sqlite`, clés API

---

## Postgres / Docker (Phase 3 — optionnel)

Réservé aux tests **infra production**, pas au dev quotidien.

```bash
./scripts/docker-dev.sh          # nécessite accès Docker
npm run verify:postgres
```

Si Docker échoue (`permission denied`) → continuer avec `./scripts/dev-backend.sh`.

**Un dev avec Docker ≠ l'autre sans Docker** : les deux peuvent travailler en parallèle sur SQLite.

---

## Comptes test (identiques après seed)

```bash
cd backend && npm run seed:accounts
```

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | client@test.com | Client@123 |
| Fournisseur | vendor@test.com | Vendor@123 |
| Admin | admin@test.com | Admin@123 |
| Banque | bank@test.com | Bank@123 |
| Transporteur | carrier@test.com | Carrier@123 |
| Technicien | tech@test.com | Tech@123 |

Chaque dev re-seed **sa** base locale après `git pull` si de nouvelles migrations apparaissent.

---

## Après un `git pull` avec migrations

```bash
cd backend
# SQLite : redémarrer le backend (migrations auto au boot)
./scripts/dev-backend.sh

# ou re-seed si besoin de données demo
npm run seed:accounts
npm run seed:group-purchases   # si module achats groupés
```

---

## Répartition Phase 3 (suggestion)

| Dev | Piste |
|-----|-------|
| **Dev A** | Infra Postgres, CI, scripts docker |
| **Dev B** | UAT, exports rapports, SMS provider, frontend |

Coordonner via `DEVELOPMENT_LOG.md` pour éviter de modifier les mêmes fichiers.

---

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| `password authentication failed bca_user` | Docker non démarré → `./scripts/dev-backend.sh` |
| `permission denied docker.sock` | `sudo usermod -aG docker $USER` puis reconnexion |
| Backend crash Redis | Retirer `REDIS_URL` du `.env` ou lancer Redis |
| Frontend n'atteint pas l'API | Vérifier backend sur **5001** et `VITE_API_URL` dans `.env.local` |

---

*Dernière mise à jour : 7 juin 2026*
