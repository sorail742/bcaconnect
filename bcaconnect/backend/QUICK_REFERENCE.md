# 🚀 Quick Reference - Refresh Token Rotation Commands

## 🔧 Setup Commands

### Start Redis
```bash
# Docker
docker run -d -p 6379:6379 redis:latest

# Or local Redis
redis-server

# Verify Redis is running
redis-cli ping
# Expected: PONG
```

### Start Backend
```bash
cd backend
npm install
npm start
```

### Expected Startup Output
```
✅ Configuration validée avec succès
🔄 Initialisation de Redis...
✅ Redis initialisé avec succès
✅ Connexion PostgreSQL établie.
✅ Modèles synchronisés.
🚀 BCA Connect Real-Time API v2.6 — Port 5000
🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis
```

## 🧪 Testing Commands

### Run All Tests
```bash
npm run test:rotation
```

### Run Specific Test
```bash
# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}' \
  -c cookies.txt -v

# Refresh token test
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# Logout test
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {accessToken}" \
  -v
```

## 📊 Monitoring Commands

### View Redis State
```bash
npm run redis:monitor
```

### Watch Redis in Real-Time
```bash
npm run redis:watch

# With custom interval (milliseconds)
npm run redis:watch 2000
```

### Clear All Redis Data
```bash
npm run redis:clear
```

### Manual Redis Commands
```bash
# Connect to Redis
redis-cli

# View all refresh tokens
KEYS "rt:*"

# View specific token
GET "rt:user-123"

# View all security incidents
KEYS "security:*"

# View specific incident
GET "security:user-123:TOKEN_REUSE_DETECTED"

# Get Redis info
INFO stats
INFO memory

# Monitor Redis in real-time
MONITOR

# Exit Redis CLI
EXIT
```

## 📝 API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "mot_de_passe": "password"
}

Response:
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "nom_complet": "...", "role": "..." }
}

Cookies:
Set-Cookie: bca_refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
```

### Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json
Cookie: bca_refresh_token=...

{
  "userId": "user-id"
}

Response:
{
  "accessToken": "eyJhbGc..."
}

Cookies:
Set-Cookie: bca_refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "message": "Déconnexion réussie."
}

Cookies:
Set-Cookie: bca_refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {accessToken}

Response:
{
  "id": "...",
  "nom_complet": "...",
  "email": "...",
  "role": "...",
  "portefeuille": { ... }
}
```

## 🔍 Debugging Commands

### Check Backend Logs
```bash
# Watch logs in real-time
npm run dev

# Look for these messages:
# ✅ Login réussi pour user {id} - Refresh token stocké en Redis
# ✅ Refresh Token rotaté avec succès pour user {id}
# ✅ Tous les tokens révoqués pour user {id}
# 🚨 COMPROMISSION DÉTECTÉE: Tentative de réutilisation du token pour user {id}
```

### Check Redis Connection
```bash
# In backend logs, look for:
# ✅ Redis initialisé avec succès

# Or check manually:
redis-cli ping
# Expected: PONG
```

### Verify Token Format
```bash
# Decode JWT token (online tool)
# https://jwt.io

# Check token algorithm
# Should be: "alg": "RS256"

# Check token expiration
# Should have: "exp": {timestamp}
```

### Check Redis Keys
```bash
redis-cli KEYS "rt:*"
# Shows all refresh tokens

redis-cli KEYS "security:*"
# Shows all security incidents

redis-cli TTL "rt:user-123"
# Shows time to live for token
```

## 🛠️ Maintenance Commands

### Restart Backend
```bash
# Stop current process (Ctrl+C)
# Then restart
npm start
```

### Restart Redis
```bash
# Docker
docker restart redis-container

# Or local Redis
# Stop current process (Ctrl+C)
# Then restart
redis-server
```

### Clear All Data
```bash
# Clear Redis
npm run redis:clear

# Or manually
redis-cli FLUSHALL
```

### View Performance Metrics
```bash
# Redis memory usage
redis-cli INFO memory

# Redis stats
redis-cli INFO stats

# Redis clients
redis-cli INFO clients
```

## 📋 Troubleshooting Commands

### Check if Redis is Running
```bash
redis-cli ping
# Expected: PONG
# If error: Redis is not running
```

### Check REDIS_URL
```bash
echo $REDIS_URL
# Expected: redis://localhost:6379
```

### Check JWT Keys
```bash
echo $JWT_PRIVATE_KEY
echo $JWT_PUBLIC_KEY
# Should show RSA key content
```

### Test Token Rotation
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}' \
  -c cookies.txt -v

# 2. Save old refresh token from Set-Cookie header

# 3. Refresh once
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# 4. Try to use old token (should fail)
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -H "Cookie: bca_refresh_token={OLD_TOKEN}" \
  -v

# Expected: 401 Unauthorized
# Message: "Token compromised - all tokens invalidated"
```

### Test Compromission Detection
```bash
# 1. Login and save tokens
# 2. Refresh once (get new token)
# 3. Try to use old token again
# 4. Check Redis for security incident

redis-cli KEYS "security:*"
# Should show: security:user-id:TOKEN_REUSE_DETECTED
```

## 📊 Monitoring Dashboard

### Create Monitoring Script
```bash
#!/bin/bash
# monitor.sh

while true; do
  clear
  echo "=== BCA Connect Monitoring ==="
  echo "Time: $(date)"
  echo ""
  echo "=== Redis Status ==="
  redis-cli ping
  echo ""
  echo "=== Active Tokens ==="
  redis-cli KEYS "rt:*" | wc -l
  echo ""
  echo "=== Security Incidents ==="
  redis-cli KEYS "security:*" | wc -l
  echo ""
  echo "=== Redis Memory ==="
  redis-cli INFO memory | grep used_memory_human
  echo ""
  sleep 5
done
```

### Run Monitoring Script
```bash
chmod +x monitor.sh
./monitor.sh
```

## 🔐 Security Commands

### Verify RS256 Signature
```bash
# Decode token at https://jwt.io
# Check "alg" field: should be "RS256"
# Check "kid" field: should match public key
```

### Check Token Expiration
```bash
# Decode token at https://jwt.io
# Check "exp" field: should be current_time + 15 minutes
# Check "iat" field: should be current_time
```

### Verify HttpOnly Cookie
```bash
# In browser DevTools → Application → Cookies
# Look for "bca_refresh_token"
# Should have: HttpOnly ✓, Secure ✓, SameSite=Lax ✓
```

## 📚 Documentation Commands

### View Documentation
```bash
# Technical documentation
cat REFRESH_TOKEN_ROTATION.md

# Implementation details
cat REFRESH_TOKEN_ROTATION_COMPLETE.md

# Testing guide
cat TESTING_GUIDE.md

# Quick start
cat REFRESH_TOKEN_ROTATION_QUICK_START.md

# Changelog
cat CHANGELOG_REFRESH_TOKEN_ROTATION.md
```

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:latest

# 2. Start backend
npm run dev

# 3. In another terminal, run tests
npm run test:rotation

# 4. Monitor Redis
npm run redis:watch

# 5. Check logs in backend terminal
```

### Testing Workflow
```bash
# 1. Run automated tests
npm run test:rotation

# 2. Monitor Redis
npm run redis:monitor

# 3. Manual testing with curl
curl -X POST http://localhost:5000/api/auth/login ...

# 4. Check logs
# Look for ✅ and 🚨 messages
```

### Debugging Workflow
```bash
# 1. Check Redis connection
redis-cli ping

# 2. View Redis keys
redis-cli KEYS "rt:*"

# 3. Check backend logs
# Look for error messages

# 4. Run tests
npm run test:rotation

# 5. Clear data if needed
npm run redis:clear
```

## 🚀 Deployment Checklist

```bash
# 1. Verify Redis is running
redis-cli ping

# 2. Check environment variables
echo $REDIS_URL
echo $JWT_PRIVATE_KEY
echo $JWT_PUBLIC_KEY

# 3. Start backend
npm start

# 4. Run tests
npm run test:rotation

# 5. Monitor Redis
npm run redis:monitor

# 6. Check logs for errors
# Look for ✅ messages

# 7. Ready for production!
```

---

**Last Updated**: 2024
**Version**: 2.6
**Status**: ✅ COMPLETE
