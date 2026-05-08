# 🔄 Refresh Token Rotation Implementation

## Overview
Refresh token rotation is a security mechanism that automatically invalidates old tokens when new ones are issued. This prevents token reuse attacks and detects compromised tokens.

## Architecture

### Components
1. **RefreshTokenService** - Manages token storage and rotation in Redis
2. **TokenService** - Orchestrates token generation and refresh
3. **AuthController** - Handles login, refresh, and logout endpoints
4. **AuthMiddleware** - Validates access tokens

### Flow Diagram

```
LOGIN
  ↓
Generate Access Token (15 min) + Refresh Token (7 days)
  ↓
Store Refresh Token Hash in Redis
  ↓
Return Access Token + Set HttpOnly Cookie with Refresh Token
  ↓
CLIENT USES ACCESS TOKEN FOR REQUESTS
  ↓
ACCESS TOKEN EXPIRES (15 min)
  ↓
CLIENT CALLS /refresh-token WITH REFRESH TOKEN
  ↓
VERIFY REFRESH TOKEN SIGNATURE
  ↓
CHECK REDIS FOR STORED TOKEN HASH
  ↓
COMPARE HASHES (Detect Reuse)
  ↓
IF MATCH: Generate New Pair + Rotate Token
IF MISMATCH: COMPROMISSION DETECTED → Revoke All Tokens
  ↓
Return New Access Token + Update Cookie
```

## Implementation Details

### 1. Token Generation (Login)

**File**: `src/controllers/authController.js` - `login()`

```javascript
const tokens = await tokenService.getTokens(user);

// Store refresh token in Redis
// Set HttpOnly cookie with refresh token
res.cookie('bca_refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**What happens**:
- Access token generated with 15-minute expiration
- Refresh token generated with 7-day expiration
- Refresh token hash stored in Redis with key `rt:{userId}`
- Refresh token sent as HttpOnly cookie (prevents XSS theft)

### 2. Token Refresh

**File**: `src/controllers/authController.js` - `refreshToken()`

```javascript
const refreshToken = req.cookies?.bca_refresh_token;
const newTokens = await tokenService.refresh(refreshToken, user);

// Update cookie with new refresh token
res.cookie('bca_refresh_token', newTokens.refreshToken, {...});
```

**What happens**:
- Extract refresh token from HttpOnly cookie
- Call `tokenService.refresh()` which calls `refreshTokenService.rotateRefreshToken()`
- Verify token signature (RS256)
- Check Redis for stored token hash
- Compare hashes:
  - **Match**: Generate new pair, store new hash, return new access token
  - **Mismatch**: COMPROMISSION DETECTED → Revoke all tokens, throw error

### 3. Token Revocation (Logout)

**File**: `src/controllers/authController.js` - `logout()`

```javascript
if (userId) {
    await refreshTokenService.revokeAllTokens(userId);
}
res.clearCookie('bca_refresh_token');
```

**What happens**:
- Delete all refresh tokens for user from Redis
- Clear HttpOnly cookie
- User must login again to get new tokens

### 4. Compromission Detection

**File**: `src/services/refreshTokenService.js` - `rotateRefreshToken()`

```javascript
if (storedHash !== oldTokenHash) {
    console.warn(`🚨 COMPROMISSION DETECTED: Token reuse for user ${userId}`);
    
    // Invalidate ALL tokens
    await this.client.del(key);
    
    // Log security incident
    await this.logSecurityIncident(userId, 'TOKEN_REUSE_DETECTED');
    
    throw new Error('Token compromised - all tokens invalidated. Re-login required.');
}
```

**What happens**:
- If token hash doesn't match stored hash → Token was reused
- Delete all tokens for user from Redis
- Log security incident
- Force user to re-login
- Attacker's stolen token becomes invalid

## Redis Data Structure

### Token Storage
```
Key: rt:{userId}
Value: SHA256(refreshToken)
TTL: 604800 seconds (7 days)

Example:
rt:user-123 → "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### Security Incident Logging
```
Key: security:{userId}:{incidentType}
Value: ISO timestamp
TTL: 86400 seconds (24 hours)

Example:
security:user-123:TOKEN_REUSE_DETECTED → "2024-01-15T10:30:45.123Z"
```

## Security Features

### 1. Asymmetric Encryption (RS256)
- Private key signs tokens (backend only)
- Public key verifies tokens (can be public)
- Prevents token forgery

### 2. HttpOnly Cookies
- Refresh token stored in HttpOnly cookie
- JavaScript cannot access (prevents XSS theft)
- Automatically sent with requests
- Cleared on logout

### 3. Token Rotation
- Old token invalidated when new one issued
- Detects token reuse (compromission)
- Revokes all tokens on detection

### 4. Short-lived Access Tokens
- 15-minute expiration
- Limits damage if stolen
- Requires refresh token to get new one

### 5. Long-lived Refresh Tokens
- 7-day expiration
- Stored securely in Redis
- Can be revoked immediately

## Testing Rotation

### Test 1: Normal Refresh Flow
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","mot_de_passe":"password"}' \
  -c cookies.txt

# 2. Use access token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {accessToken}"

# 3. Refresh token (after access token expires)
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt

# Expected: New access token returned
```

### Test 2: Compromission Detection
```bash
# 1. Login and get tokens
# 2. Save old refresh token
# 3. Refresh once (get new token)
# 4. Try to use old refresh token again

curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -H "Cookie: bca_refresh_token={oldRefreshToken}"

# Expected: 401 error "Token compromised - all tokens invalidated"
# All tokens for user should be revoked in Redis
```

### Test 3: Logout Revocation
```bash
# 1. Login
# 2. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {accessToken}"

# 3. Try to refresh with old token
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  -b cookies.txt

# Expected: 401 error "Refresh token not found"
```

## Environment Variables

```env
# JWT Configuration
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Token Expiration
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

## Monitoring

### Logs to Watch
```
✅ Login réussi pour user {id} - Refresh token stocké en Redis
✅ Refresh Token rotaté avec succès pour user {id}
✅ Tous les tokens révoqués pour user {id}
🚨 COMPROMISSION DÉTECTÉE: Tentative de réutilisation du token pour user {id}
```

### Redis Monitoring
```bash
# Monitor Redis keys
redis-cli KEYS "rt:*"
redis-cli KEYS "security:*"

# Check token expiration
redis-cli TTL "rt:user-123"

# View stored hash
redis-cli GET "rt:user-123"
```

## Fallback for Development (No Redis)

When Redis is not available in development:
- Tokens are still generated with RS256
- Rotation detection is skipped
- All methods return success
- Production requires Redis

```javascript
if (!this.client.isOpen) {
    console.warn('⚠️ Redis not connected - token rotation disabled');
    return true; // Continue without Redis in dev
}
```

## Troubleshooting

### Issue: "Socket already opened"
**Solution**: Remove automatic `connect()` call in constructor. Call `connect()` only once in `index.js`.

### Issue: Tokens not being stored in Redis
**Solution**: Check `REDIS_URL` environment variable. Verify Redis is running.

### Issue: Refresh token always fails
**Solution**: Ensure HttpOnly cookie is being set and sent. Check browser cookie settings.

### Issue: Compromission not detected
**Solution**: Verify token hash comparison logic. Check Redis key format.

## Future Enhancements

1. **Token Blacklist**: Maintain blacklist of revoked tokens
2. **Device Tracking**: Track devices per user, revoke specific device tokens
3. **Geo-blocking**: Detect unusual login locations
4. **Rate Limiting**: Limit refresh attempts per user
5. **Token Binding**: Bind tokens to IP address or device fingerprint

## References

- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC 6750 - OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [OWASP - Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Redis Documentation](https://redis.io/documentation)
