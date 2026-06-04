# Déploiement Production — BCA Connect + CinetPay

Guide pas-à-pas pour activer les paiements Mobile Money en production.

---

## 1. Prérequis

- Compte marchand [CinetPay](https://cinetpay.com) (Guinée — Orange Money / MTN)
- Backend accessible en HTTPS (Render, Azure, VPS…)
- PostgreSQL + Redis (recommandé pour refresh tokens)
- Frontend déployé (Vercel, Netlify…)

---

## 2. Variables d'environnement backend

Copier `backend/.env.example` → `backend/.env` (ou secrets du provider cloud) :

```env
NODE_ENV=production
PORT=3000

# URLs publiques (OBLIGATOIRE pour CinetPay)
FRONTEND_URL=https://votre-app.vercel.app
BACKEND_URL=https://api.bcaconnect.gn

# CinetPay — Dashboard → Intégration API
PAYMENT_API_KEY=votre_apikey
PAYMENT_SITE_ID=votre_site_id
PAYMENT_SECRET=votre_secret_hmac

# Optionnel — défaut API v2
PAYMENT_PROVIDER_URL=https://api-checkout.cinetpay.com/v2/payment

# Auth & sécurité (inchangé)
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
ENCRYPTION_KEY=...   # 64 hex chars
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GROQ_API_KEY=...
```

---

## 3. Configuration CinetPay (portail marchand)

1. **URL de notification** : `{BACKEND_URL}/api/payments/webhook`  
   Exemple : `https://api.bcaconnect.gn/api/payments/webhook`

2. **URL de retour** : gérée automatiquement → `{FRONTEND_URL}/wallet?status=success&tx=...`  
   Pour commandes MM : le frontend redirige vers CinetPay puis retour orders.

3. **Devise** : GNF (configurée dans `paymentProviderService.js`)

4. **Tester** avec un petit montant (1000 GNF) avant le lancement pilote.

---

## 4. Migration base de données

Au démarrage du backend, les colonnes suivantes sont ajoutées automatiquement (`runSafeMigrations`) :

- `details_commandes.escrow_released`
- `litiges.resolution_type`, `remboursement_montant`, `preuves`

**Action** : redémarrer le serveur une fois après déploiement :

```bash
cd backend
npm start
# Vérifier les logs : "✅ Migration : colonne 'escrow_released'..."
```

---

## 5. Checklist de validation prod

| Test | Commande / Action | Résultat attendu |
|------|-------------------|------------------|
| Health | `GET /api/health` | 200 OK |
| Paiement wallet | Checkout wallet | Commande `payé` + séquestre |
| Paiement MM | Checkout mobile_money | Redirect CinetPay → webhook → `payé` |
| Webhook HMAC | Log CinetPay | Pas de `403 Signature` |
| Litige | Admin resolve integral | Remboursement wallet acheteur |
| CI | `npm run test:security` | 14/14 PASS |

---

## 6. Désactiver la simulation

En production avec clés CinetPay configurées :

- `POST /api/payments/capture-simulation` → **403** (désactivé)
- Pas de fallback simulation dans `paymentProviderService`

---

## 7. Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `PAYMENT_API_KEY requis` | Clés manquantes | Remplir `.env` prod |
| Webhook 403 | `PAYMENT_SECRET` incorrect | Recopier secret CinetPay |
| Commande bloquée `en_attente_paiement` | Webhook non reçu | Vérifier URL HTTPS + firewall |
| Escrow vide vendeur | Paiement wallet non confirmé | Vérifier statut commande `payé` |

---

## 8. Frontend prod

```env
VITE_API_URL=https://api.bcaconnect.gn/api
```

Rebuild et redeploy après changement des variables Vite.

---

*BCA Connect v2.6 — Équipe Dev*
