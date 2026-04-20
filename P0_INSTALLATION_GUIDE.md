# 🚀 GUIDE D'INSTALLATION & TEST - P0 RS256 + Refresh Token Rotation

## 📦 Installation des Dépendances

```bash
cd backend
npm install
```

**Dépendances installées:**
- `redis@^4.6.12` - Cache et rotation des tokens
- `express-validator@^7.0.0` - Validation des DTOs
- `joi@^17.11.0` - Validation des variables d'env
- `winston@^3.11.0` - Logging sécurisé

---

## ⚙️ Configuration Requise

### 1. Variables d'Environnement (.env)

Vérifiez que votre `.env` contient:

```env
# Environnement
NODE_ENV=development
PORT=5000

# JWT - RS256 (Asymétrique)
JWT_SECRET=d45259cf4cb572049b1c75c5ef9d0893b2bea7c3f3e8b7637d856a87530fd1df
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"

# Chiffrement AES-256-GCM
ENCRYPTION_KEY=d45259cf4cb572049b1c75c5ef9d0893b2bea7c3f3e8b7637d856a87530fd1df

# Redis - Refresh Token Rotation
REDIS_URL=rediss://default:PASSWORD@HOST:6379

# Base de données
DATABASE_URL=postgresql://user:pass@localhost/bcaconnect
# OU laisser vide pour SQLite

# Groq AI
GROQ_API_KEY=gsk_...

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

### 2. Générer les Clés RS256 (si nécessaire)

```bash
# Générer une clé privée RSA
openssl genrsa -out private.pem 2048

# Générer la clé publique correspondante
openssl rsa -in private.pem -pubout -out public.pem

# Afficher les clés pour les copier dans .env
cat private.pem
cat public.pem
```

### 3. Générer la Clé de Chiffrement AES-256

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Vérification de la Configuration

### 1. Démarrer le serveur

```bash
npm run dev
```

**Sortie attendue:**
```
✅ Configuration validée avec succès
🔄 Initialisation de Redis...
✅ Redis connecté
✅ Connexion PostgreSQL établie.
✅ Modèles synchronisés.

🚀 BCA Connect Real-Time API v2.6 — Port 5000
🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis
📊 Environnement: development
```

### 2. Tester l'Authentification

```bash
# 1. Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom_complet": "Test User",
    "email": "test@example.com",
    "telephone": "+224612345678",
    "mot_de_passe": "SecurePassword123!",
    "role": "client"
  }'

# Réponse attendue:
{
  "message": "Compte créé avec succès",
  "user": {
    "id": "uuid",
    "nom_complet": "Test User",
    "role": "client",
    "est_approuve": true
  }
}
```

```bash
# 2. Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mot_de_passe": "SecurePassword123!"
  }'

# Réponse attendue:
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nom_complet": "Test User",
    "role": "client"
  }
}
```

### 3. Tester l'Accès Protégé

```bash
# Utiliser l'accessToken reçu
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Réponse attendue:
{
  "id": "uuid",
  "nom_complet": "Test User",
  "email": "test@example.com",
  "role": "client",
  ...
}
```

### 4. Tester la Rotation des Refresh Tokens

```bash
# Rafraîchir les tokens
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid"
  }' \
  -H "Cookie: bca_refresh_token=..."

# Réponse attendue:
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔍 Vérification de la Sécurité

### 1. Vérifier que RS256 est utilisé

```bash
# Décoder le token (sans vérifier la signature)
node -e "
const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
const decoded = jwt.decode(token, { complete: true });
console.log(JSON.stringify(decoded, null, 2));
"

# Vérifier que "alg": "RS256" est présent
```

### 2. Vérifier que les tokens expirent

```bash
# Vérifier l'expiration du token
node -e "
const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
const decoded = jwt.decode(token, { complete: true });
console.log('Expire in:', new Date(decoded.payload.exp * 1000));
"

# Access Token: ~15 minutes
# Refresh Token: ~7 days
```

### 3. Vérifier Redis

```bash
# Vérifier que Redis est connecté
redis-cli ping
# Réponse: PONG

# Vérifier les tokens stockés
redis-cli keys "rt:*"
# Réponse: liste des tokens stockés
```

### 4. Tester la Détection de Compromission

```bash
# 1. Obtenir un refresh token
# 2. Essayer de le réutiliser deux fois

# Première utilisation: OK
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid"}' \
  -H "Cookie: bca_refresh_token=OLD_TOKEN"

# Deuxième utilisation: ERREUR
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid"}' \
  -H "Cookie: bca_refresh_token=OLD_TOKEN"

# Réponse attendue:
{
  "message": "Token compromis - tous les tokens invalidés. Reconnexion requise."
}
```

---

## 📊 Logs de Sécurité

### Vérifier les logs

```bash
# Voir les logs en temps réel
tail -f logs/security.log

# Chercher les incidents
grep "COMPROMISSION" logs/security.log
grep "TOKEN_REUSE_DETECTED" logs/security.log
```

### Événements loggés

```
✅ Tokens générés pour user {userId}
✅ Refresh token stocké pour user {userId}
✅ Refresh token rotaté pour user {userId}
✅ Tous les tokens révoqués pour user {userId}
⚠️ Tentative d'accès avec token invalide: {error}
🚨 COMPROMISSION DÉTECTÉE: Tentative de réutilisation du token pour user {userId}
🚨 Incident de sécurité: TOKEN_REUSE_DETECTED pour user {userId}
```

---

## 🐛 Dépannage

### Erreur: "DATABASE_URL is required"

**Solution:**
```bash
# Ajouter DATABASE_URL au .env
DATABASE_URL=postgresql://user:pass@localhost/bcaconnect

# OU laisser vide pour SQLite (développement)
# Mais la validation Joi le rend optionnel
```

### Erreur: "JWT_PRIVATE_KEY is required"

**Solution:**
```bash
# Vérifier que JWT_PRIVATE_KEY est dans .env
# Vérifier que les sauts de ligne sont correctement échappés
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n"
```

### Erreur: "REDIS_URL is required"

**Solution:**
```bash
# Ajouter REDIS_URL au .env
REDIS_URL=rediss://default:PASSWORD@HOST:6379

# Ou utiliser Redis local
REDIS_URL=redis://localhost:6379
```

### Erreur: "Redis connecté" mais pas de connexion

**Solution:**
```bash
# Vérifier que Redis est en cours d'exécution
redis-cli ping

# Ou démarrer Redis
redis-server

# Ou utiliser Redis Cloud (Upstash)
# https://upstash.com
```

---

## 📈 Métriques de Sécurité

### Avant P0
```
❌ HS256 (symétrique)
❌ Tokens jamais expirés
❌ Pas de rotation
❌ Pas de détection de compromission
Score: 47% (CRITIQUE)
```

### Après P0
```
✅ RS256 (asymétrique)
✅ Access Token: 15 min
✅ Refresh Token: 7 jours
✅ Rotation automatique
✅ Détection de réutilisation
✅ Redis pour la persistance
Score: 75% (BON)
```

---

## 🎯 Prochaines Étapes

1. **P0 Suivant:** Validation Globale des DTOs
2. **P1:** Chiffrement des Données (AES-256-GCM)
3. **P1:** Secrets Management (AWS Secrets Manager)
4. **P1:** Helmet Configuration Complète
5. **P1:** 2FA TOTP pour Admins

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `tail -f logs/security.log`
2. Vérifiez la configuration: `npm run dev`
3. Testez Redis: `redis-cli ping`
4. Testez les endpoints: Utilisez les commandes curl ci-dessus

---

**Status:** ✅ P0 COMPLÉTÉ
**Date:** 2024
**Version:** 2.6
