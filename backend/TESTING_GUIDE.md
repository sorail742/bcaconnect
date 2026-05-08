# 🔄 Refresh Token Rotation - Testing & Monitoring Guide

## Quick Start

### 1. Ensure Redis is Running

```bash
# Windows (using WSL or Docker)
docker run -d -p 6379:6379 redis:latest

# Or if Redis is installed locally
redis-server
```

### 2. Start Backend Server

```bash
cd backend
npm install
npm start
```

You should see:
```
✅ Configuration validée avec succès
🔄 Initialisation de Redis...
✅ Redis initialisé avec succès
✅ Connexion PostgreSQL établie.
✅ Modèles synchronisés.
🚀 BCA Connect Real-Time API v2.6 — Port 5000
🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis
```

### 3. Run Tests

```bash
# Test refresh token rotation
node test-refresh-rotation.js

# Monitor Redis in real-time
node redis-monitor.js watch

# View current Redis state
node redis-monitor.js monitor

# Clear all tokens (for testing)
node redis-monitor.js clear
```

## Testing Scenarios

### Scenario 1: Normal Login & Refresh Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}' \
  -c cookies.txt -v

# Expected response:
# {
#   "message": "Connexion réussie",
#   "accessToken": "eyJhbGc...",
#   "user": { "id": "...", "nom_complet": "...", "role": "..." }
# }
# Set-Cookie: bca_refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax

# 2. Use access token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {accessToken}" \
  -v

# Expected: 200 OK with user data

# 3. Wait for access token to expire (15 minutes) or simulate expiration
# Then refresh:
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# Expected response:
# {
#   "accessToken": "eyJhbGc..." (NEW TOKEN)
# }
# Set-Cookie: bca_refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax (NEW TOKEN)
```

### Scenario 2: Compromission Detection (Token Reuse)

```bash
# 1. Login and save tokens
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}' \
  -c cookies.txt -v

# Save the refresh token from Set-Cookie header
# Example: bca_refresh_token=eyJhbGc...

# 2. Refresh once (get new token)
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# New refresh token is set in cookie

# 3. Try to use OLD refresh token again
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -H "Cookie: bca_refresh_token={OLD_REFRESH_TOKEN}" \
  -v

# Expected response: 401 Unauthorized
# {
#   "message": "Token compromised - all tokens invalidated. Re-login required."
# }

# 4. Verify all tokens are revoked (even the new one)
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# Expected response: 401 Unauthorized
# {
#   "message": "Refresh token not found - re-login required"
# }
```

### Scenario 3: Logout & Token Revocation

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}' \
  -c cookies.txt -v

# Save access token and refresh token

# 2. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {accessToken}" \
  -v

# Expected response:
# {
#   "message": "Déconnexion réussie."
# }
# Set-Cookie: bca_refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0

# 3. Try to use old refresh token
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt -v

# Expected response: 401 Unauthorized
# {
#   "message": "Refresh token not found - re-login required"
# }
```

## Monitoring Redis

### View Current State

```bash
node redis-monitor.js monitor
```

Output:
```
✅ Connected to Redis

📋 Refresh Tokens in Redis:
────────────────────────────────────────────────────
   rt:user-123
   ├─ Hash: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
   └─ Expires: 6d 23h 45m

🚨 Security Incidents:
────────────────────────────────────────────────────
   (No incidents recorded)

📊 Redis Statistics:
────────────────────────────────────────────────────
# Stats
total_connections_received:42
total_commands_processed:156
...
```

### Watch in Real-Time

```bash
node redis-monitor.js watch 3000
```

This will refresh every 3 seconds and show:
- Number of active refresh tokens
- Number of security incidents
- Real-time updates

### Clear All Data

```bash
node redis-monitor.js clear
```

## Automated Test Suite

Run the complete test suite:

```bash
node test-refresh-rotation.js
```

This will:
1. ✅ Test login and token storage
2. ✅ Test access token validation
3. ✅ Test token refresh and rotation
4. ✅ Test compromission detection
5. ✅ Test logout and revocation

Expected output:
```
🔐 Refresh Token Rotation Test Suite
==================================================
API URL: http://localhost:5000/api
Test User: test@example.com

📝 Test 1: Login and Token Storage
──────────────────────────────────────────────────
✅ Login successful
   User ID: user-123
   Access Token: eyJhbGciOiJSUzI1NiIs...
   Cookies: bca_refresh_token=eyJhbGciOiJSUzI1NiIs...

📝 Test 2: Access Token Validation
──────────────────────────────────────────────────
✅ Access token is valid
   User: John Doe
   Role: client

📝 Test 3: Token Refresh and Rotation
──────────────────────────────────────────────────
✅ Token refresh successful
   New Access Token: eyJhbGciOiJSUzI1NiIs...
   New Refresh Token: eyJhbGciOiJSUzI1NiIs...

📝 Test 4: Compromission Detection (Token Reuse)
──────────────────────────────────────────────────
✅ Compromission detected correctly
   Error: Token compromised - all tokens invalidated. Re-login required.
   All tokens for user have been revoked

📝 Test 5: Logout and Token Revocation
──────────────────────────────────────────────────
✅ Logout successful
   Message: Déconnexion réussie.
✅ Token revoked after logout

✅ All tests passed!
==================================================

🎉 Refresh Token Rotation is working correctly!
```

## Logs to Monitor

Watch backend logs for these messages:

### Successful Operations
```
✅ Login réussi pour user {id} - Refresh token stocké en Redis
✅ Refresh Token rotaté avec succès pour user {id}
✅ Tous les tokens révoqués pour user {id}
```

### Security Events
```
🚨 COMPROMISSION DÉTECTÉE: Tentative de réutilisation du token pour user {id}
🚨 Incident de sécurité: TOKEN_REUSE_DETECTED pour user {id}
```

### Errors
```
❌ Impossible de connecter à Redis: Error: ...
⚠️ Redis non connecté - token non stocké
```

## Troubleshooting

### Issue: "Socket already opened"
**Solution**: Already fixed! The constructor no longer calls `connect()` automatically.

### Issue: Redis connection fails
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis URL
echo $REDIS_URL
# Should be: redis://localhost:6379

# Restart Redis
docker restart redis-container
```

### Issue: Tokens not stored in Redis
```bash
# Check Redis keys
redis-cli KEYS "rt:*"

# If empty, check logs for:
# ⚠️ Redis non connecté - token non stocké

# Verify Redis connection in backend logs
# Should see: ✅ Redis initialisé avec succès
```

### Issue: Compromission not detected
```bash
# Check token hash comparison
redis-cli GET "rt:user-123"

# Verify token signature
# Access token should be RS256 (not HS256)

# Check logs for:
# 🚨 COMPROMISSION DÉTECTÉE
```

## Performance Metrics

### Expected Performance
- Login: < 200ms
- Token refresh: < 100ms
- Compromission detection: < 50ms
- Logout: < 100ms

### Redis Memory Usage
- Per token: ~100 bytes
- Per incident: ~50 bytes
- 1000 users: ~150KB

## Security Checklist

- [x] RS256 asymmetric encryption
- [x] HttpOnly cookies for refresh tokens
- [x] 15-minute access token expiration
- [x] 7-day refresh token expiration
- [x] Token rotation on refresh
- [x] Compromission detection
- [x] Automatic token revocation
- [x] Security incident logging
- [x] Graceful Redis fallback (dev only)

## Next Steps

1. **Deploy to Production**: Ensure Redis is running on production server
2. **Monitor Incidents**: Set up alerts for security incidents
3. **Implement Rate Limiting**: Limit refresh attempts per user
4. **Add Device Tracking**: Track devices per user
5. **Implement Geo-blocking**: Detect unusual login locations

## References

- [REFRESH_TOKEN_ROTATION.md](./REFRESH_TOKEN_ROTATION.md) - Technical documentation
- [Redis Documentation](https://redis.io/documentation)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
