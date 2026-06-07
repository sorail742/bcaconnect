# Staging CinetPay — BCA Connect

Guide pour tester les paiements Mobile Money réels avant la production.

---

## 1. Prérequis

| Élément | Détail |
|---------|--------|
| Compte CinetPay | [cinetpay.com](https://cinetpay.com) — clés API + `site_id` + secret HMAC |
| Tunnel HTTPS | CinetPay exige une `notify_url` accessible en HTTPS |
| Frontend | Déployé (Vercel) ou tunnel sur le port 3002 |

---

## 2. Tunnel HTTPS local (ngrok)

```bash
# Terminal A — backend
cd backend
env -u REDIS_URL PORT=5001 npm run dev

# Terminal B — tunnel
ngrok http 5001
# Copier l'URL HTTPS → BACKEND_URL (ex: https://abc123.ngrok-free.app)
```

Dans le portail CinetPay → **URL de notification** :

```
https://abc123.ngrok-free.app/api/payments/webhook
```

Méthode : **POST**, content-type : **x-www-form-urlencoded**.

---

## 3. Variables d'environnement

Copier `backend/.env.staging.example` et renseigner :

```env
NODE_ENV=staging
PAYMENT_MODE=live
PAYMENT_API_KEY=...
PAYMENT_SITE_ID=...
PAYMENT_SECRET=...
BACKEND_URL=https://abc123.ngrok-free.app
FRONTEND_URL=http://localhost:3002
```

Frontend (`frontend/.env.local`) :

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

> En staging mixte (frontend local + backend tunnelé), `FRONTEND_URL` peut rester `http://localhost:3002` pour les `return_url`. Pour un test bout-en-bout HTTPS, déployez aussi le frontend.

---

## 4. Démarrer en mode live

```bash
cd backend
export PAYMENT_MODE=live
export PAYMENT_API_KEY=...
export PAYMENT_SITE_ID=...
export PAYMENT_SECRET=...
export BACKEND_URL=https://votre-tunnel.ngrok-free.app
export FRONTEND_URL=http://localhost:3002
env -u REDIS_URL PORT=5001 npm run dev
```

---

## 5. Valider la configuration

```bash
cd backend
PAYMENT_MODE=live API_URL=http://localhost:5001/api node scripts/test-cinetpay-staging.js --check-env
```

Sans clés (simulation locale) :

```bash
node scripts/test-cinetpay-staging.js
```

---

## 6. Parcours de test manuel

### Recharge wallet

1. Login `client@test.com` / `Client@123`
2. `/wallet` → déposer **1000 GNF**
3. Redirection CinetPay → valider sur téléphone
4. Retour `/payment/return?tx=...` → polling → wallet crédité

### Commande Mobile Money

1. Marketplace → panier → checkout
2. Paiement **Mobile Money**
3. Redirection CinetPay → webhook → commande `payé` + séquestre vendeur
4. Retour `/payment/return?type=order` → `/orders`

---

## 7. Flux technique

```
Client → POST /api/payments/initiate
      → CinetPay payment_url
      → Utilisateur paie
      → CinetPay POST /api/payments/webhook (HMAC x-token)
      → verifyTransactionStatus (double-check)
      → escrow / wallet crédité
      → Frontend /payment/return poll GET /api/payments/status/:id
```

La vérification HMAC suit la [documentation CinetPay](https://docs.cinetpay.com/api/1.0-fr/checkout/hmac) (concaténation des champs `cpm_*`).

---

## 8. Dépannage

| Symptôme | Solution |
|----------|----------|
| Webhook 403 | Vérifier `PAYMENT_SECRET` + header `x-token` |
| Pas de redirect CinetPay | Vérifier `PAYMENT_API_KEY` + `PAYMENT_SITE_ID` |
| Commande bloquée `en_attente_paiement` | Logs webhook + URL tunnel active |
| Simulation au lieu de CinetPay | `PAYMENT_MODE=live` + clés renseignées |
| `capture-simulation` 403 | Normal en mode live |

---

## 9. Passage production

Voir [`backend/DEPLOYMENT_PROD.md`](./backend/DEPLOYMENT_PROD.md) — mêmes variables, `NODE_ENV=production`, URLs définitives HTTPS.
