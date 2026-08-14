# Rapport de charge k6 — premier run réel (cahier des charges 3.17)

**Date** : 2026-08-13
**Exécution** : GitHub Actions (`ubuntu-latest`), run [31727387254](https://github.com/sorail742/bcaconnect/actions/runs/31727387254)
**Cible** : stack `docker-compose` éphémère du runner CI (Postgres 15, Redis 7, backend Node buildé depuis `backend/Dockerfile`) — **jamais la production**, conformément à `loadtests/config/README.md` (infra Render/Neon actuelle en free-tier, non dimensionnée pour de la charge).
**Script** : [`loadtests/scenarios/main.js`](./scenarios/main.js)

## Résultat en un coup d'œil

| Scénario | VUs | Durée | Seuil latence (p95) | Résultat latence | Seuil erreurs | Résultat erreurs |
|---|---|---|---|---|---|---|
| `products` — `GET /api/products` | 100 | 2 min | < 500 ms | ✅ **8.65 ms** | < 1% | ✅ **0.00%** (0/11 951) |
| `checkout` — `POST /api/orders` (wallet) | 25 | 2 min | < 800 ms | ✅ **22.22 ms** | < 1% | ✅ **0.00%** (0/2 959) |
| `auth_login` — `POST /api/auth/login` | 50 | 2 min | < 300 ms | ❌ **4.12 s** | < 1% | ✅ **0.00%** (0/1 400) |

**16 314 requêtes HTTP au total (38.7 req/s), 17 710 checks — 100% de checks réussis.** Le seul seuil non tenu est la latence de connexion, pas le taux d'erreur : chaque connexion a fini par réussir, juste beaucoup plus lentement que la cible.

## Lecture du résultat `auth_login`

Ce n'est pas un bug — c'est exactement le signal que ce scénario est censé révéler (voir le plan de production-readiness, Phase 4 : *"gate de tout flux authentifié, exercise bcrypt cost"*). `bcrypt.compare()` est volontairement coûteux en CPU ; à 50 connexions concurrentes sur un runner GitHub Actions à 2 cœurs partagés (pas la taille réelle d'un serveur de prod), les requêtes se mettent en file au niveau de l'event loop / pool CPU plutôt que d'échouer — d'où un p95 à 4.12s mais un taux d'erreur à 0%.

**Recommandation** : ne pas relâcher le coût bcrypt (c'est une protection de sécurité). Si ce seuil doit tenir en production, les leviers sont : (a) confirmer le nombre de cœurs réellement alloués sur le plan Render cible, (b) envisager un throttling explicite du endpoint login plutôt que de laisser la latence absorber la charge, (c) republier ce scénario une fois la taille d'infra de production connue, avec un seuil recalibré sur cette base plutôt que sur un chiffre de départ arbitraire.

## Bugs réels découverts et corrigés pendant cet exercice

Obtenir ce premier rapport propre a nécessité 6 itérations push → CI → diagnostic → fix. Deux de ces découvertes dépassent largement le cadre de "faire tourner k6" :

1. **[`b828046`] Bug de production potentiel** — `categoryAttributes.js` chargeait dynamiquement `../../../frontend/src/category/lib/categoryAttributeProfiles.js` par chemin relatif. Fonctionne en dev local (backend/ et frontend/ côte à côte sur disque) mais **crash immédiat au démarrage** (`ERR_MODULE_NOT_FOUND`) dès que le backend est déployé/conteneurisé isolément — exactement la configuration de `docker-compose.yml` (`build: ./backend`) et très probablement de Render en production (`render.yaml` vit dans `backend/`, donc `Root Directory: backend`). Corrigé en dupliquant le fichier dans `backend/src/constants/` (converti en CommonJS).
2. **[`aab0a85`] Incohérence API réelle** — `order.validator.js` documente `items[].produit_id`/`items[].quantite` comme acceptés, mais `orderService.create` ne lisait que `item.productId`/`item.quantity` (anglais). Un appelant suivant le contrat du validateur passait la validation puis échouait silencieusement dans le service. Le frontend envoie toujours les noms anglais donc jamais atteint en usage réel, mais c'est resté un vrai défaut d'API. Corrigé en ajoutant les alias français, sans toucher à la logique transactionnelle (anti-fraude, réservation de stock, coupons).
3. **[`42c2a33`] `grafana/k6-action` inutilisable en CI** — cette action exécute k6 dans son propre conteneur Docker, sur un réseau (`github_network`) jamais connecté à celui créé par `docker compose up` (`bcaconnect_default`) — `BASE_URL=localhost:5000` y est injoignable. Remplacé par le binaire k6 natif (dépôt apt officiel), exécuté directement dans le netns du runner.
4. **[`7374b8b`] Catégories jamais semées** — `ensureDefaultCategories()` ne s'exécute que si `NODE_ENV !== 'production'` ; `docker-compose.yml` positionne `NODE_ENV=production` pour refléter le vrai déploiement, donc la table `categories` restait vide et `setup()` du scénario échouait. Résolu en réutilisant `scripts/seed-categories.js` en étape CI plutôt qu'en changeant le comportement de production.
5. **[`5124385`] `docker-compose.yml` n'avait jamais pu démarrer le backend** — `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`/`GROQ_API_KEY` sont requis par `envValidation.js` mais absents du service `backend`. `docker compose up` sur ce fichier était cassé avant même ce ticket.
6. **[`5124385`] Rate limiter** — `express-rate-limit` (1000 req/15min global) aurait renvoyé des 429 bien avant la capacité réelle du serveur. Ajout de `LOAD_TEST_MODE`, positionné uniquement par ce workflow, jamais en production.

## Méthodologie

- **Exécution séquentielle** (`startTime` décalé par scénario) pour que les métriques de chacun restent lisibles indépendamment, plutôt que 3 scénarios qui se chevauchent et se polluent mutuellement.
- **`setup()` auto-suffisant** : crée son propre produit de test (500 GNF, stock 1M) plutôt que de dépendre d'un état préexistant, pour que le script reste rejouable à l'identique sur une stack fraîche.
- **Aucune donnée de production touchée** — comptes `*@test.com`, portefeuille crédité à 500M GNF uniquement pour ce run (`scripts/fund-load-test-wallet.js`, jamais appelé hors CI de charge).
- Le stub webhook de recharge wallet (argent réel) n'est **jamais** sollicité par ces scénarios, conformément à la consigne du plan initial.

## Prochaines étapes suggérées (non bloquantes)

- Une fois la taille réelle de l'infra de production connue (plan Render payant, nombre de cœurs), recalibrer le seuil `auth_login` sur cette base et republier ce rapport contre un déploiement staging dédié plutôt que le runner CI partagé.
- Étendre à un scénario de recherche filtrée (`GET /api/products?search=...&categorie_id=...`) — le scénario `products` actuel teste la liste paginée simple, pas le chemin de requête `Op.or`/`Op.between` plus coûteux.
- Programmer ce workflow en nightly (`schedule` déjà en place) pour détecter une régression de capacité avant qu'elle n'atteigne la production.
