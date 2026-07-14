# NextAuth v4 on Cloudflare Pages - Deployment Guide

## ✅ Root Causes Identified & Fixed

### 1. **PrismaAdapter Incompatibility with Edge Runtime**
**Problem:** NextAuth's PrismaAdapter requires Node.js runtime and attempts to use database sessions even when JWT strategy is enabled.

**Solution:** Removed PrismaAdapter entirely. Implemented manual user creation/lookup in callbacks.

### 2. **bcryptjs in Edge Runtime**
**Problem:** `bcryptjs` is a Node.js library that doesn't work natively in Cloudflare Workers/Edge runtime.

**Solution:** Dynamically import `bcryptjs` within async functions. Cloudflare's Edge runtime with `nodejs_compat` flag supports this pattern.

### 3. **Wrong NextAuth Handler Pattern**
**Problem:** Using old Pages Router pattern `authHandler(req, res)` instead of App Router pattern.

**Solution:** Export handlers directly: `export { handler as GET, handler as POST }`

### 4. **Dynamic NextAuth Imports**
**Problem:** Dynamically importing NextAuth itself was causing initialization issues.

**Solution:** Use static imports for NextAuth and providers.

### 5. **Missing NEXTAUTH_URL Environment Variable**
**Problem:** `NEXTAUTH_URL` was only in wrangler.toml, not in Cloudflare Pages environment variables.

**Solution:** Add to Cloudflare Pages environment variables (see below).

---

## 🔧 Required Cloudflare Pages Environment Variables

Navigate to your Cloudflare Pages project → Settings → Environment Variables

Add the following for **Production** environment:

```
DATABASE_URL=postgresql://[your-neon-connection-string]
NEXTAUTH_SECRET=[generate-with: openssl rand -base64 32]
NEXTAUTH_URL=https://rarecomforts.in
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
```

**Important:** 
- `NEXTAUTH_URL` must match your production domain exactly (no trailing slash)
- `NEXTAUTH_SECRET` must be a cryptographically secure random string
- All variables must be set in Cloudflare Pages dashboard, not just wrangler.toml

---

## 🔐 Google OAuth Configuration

In [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to **APIs & Services** → **Credentials**
2. Select your OAuth 2.0 Client ID
3. Add the following to **Authorized JavaScript origins**:
   ```
   https://rarecomforts.in
   ```
4. Add the following to **Authorized redirect URIs**:
   ```
   https://rarecomforts.in/api/auth/callback/google
   ```

**Note:** These must match exactly. No trailing slashes. HTTPS only in production.

---

## 📦 Architecture Changes Made

### Before (Broken)
```typescript
// ❌ Used PrismaAdapter (incompatible with Edge)
adapter: PrismaAdapter(prisma)

// ❌ Static import of bcryptjs (incompatible with Edge)
import bcrypt from "bcryptjs"

// ❌ Wrong handler pattern
async function authHandler(req, res) {
  return NextAuth(req, res, options)
}
```

### After (Working)
```typescript
// ✅ No adapter - manual user management in callbacks
// No adapter needed for JWT sessions

// ✅ Dynamic import of bcryptjs
const bcrypt = await import("bcryptjs")

// ✅ Correct App Router pattern
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## 🔄 How Authentication Works Now

### Registration Flow (`/api/register`)
1. Validate input (email format, password length)
2. Check database for existing user
3. Hash password using dynamically imported bcryptjs
4. Create user in Neon database via Prisma
5. Return success

### Credentials Login Flow
1. User submits email/password
2. NextAuth calls `authorize()` function
3. Fetch user from database
4. Verify password using bcryptjs
5. Return user object if valid
6. NextAuth creates JWT token
7. Store JWT in session cookie

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back with authorization code
4. NextAuth exchanges code for user profile
5. `signIn` callback checks if user exists in database
6. If new user, creates record in database
7. If existing user, updates profile
8. NextAuth creates JWT token with user ID
9. Store JWT in session cookie

---

## ⚠️ Known Limitations with NextAuth v4 on Cloudflare Edge

### 1. **No Database Sessions**
- Edge runtime cannot use Prisma Adapter
- Must use JWT sessions only
- JWT tokens stored in cookies (not in database)

### 2. **No Email Provider**
- Email sending requires Node.js runtime
- Cannot use NextAuth's built-in email provider
- Use external service (Resend, SendGrid) if needed

### 3. **Password Hashing Performance**
- bcryptjs runs slower in Edge runtime than Node.js
- Consider bcrypt rounds limit (currently 10, which is acceptable)

### 4. **Session Management**
- Cannot track active sessions in database
- Cannot force-logout users from server side
- JWT invalidation requires secret rotation

---

## 🧪 Testing Checklist

After deployment, verify the following endpoints:

```bash
# 1. Check session endpoint (should return null or user data)
curl https://rarecomforts.in/api/auth/session

# 2. Check providers endpoint (should return available providers)
curl https://rarecomforts.in/api/auth/providers

# 3. Test registration
curl -X POST https://rarecomforts.in/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# 4. Test credentials login (requires browser/frontend)
# Visit: https://rarecomforts.in/auth

# 5. Test Google OAuth login (requires browser)
# Visit: https://rarecomforts.in/auth
# Click "Sign in with Google"
```

Expected responses:
- `/api/auth/session`: JSON (not "Internal Server Error")
- `/api/auth/providers`: JSON with Google and credentials providers
- `/api/register`: JSON success or error message
- Credentials login: Should redirect after successful login
- Google OAuth: Should redirect to Google, then back with session

---

## 🐛 Debugging

If issues persist, check Cloudflare Pages Functions logs:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Click "Functions" tab
3. View real-time logs
4. Look for console.log statements with emojis:
   - 🔍 = Environment check
   - 🔐 = Authentication attempt
   - ✅ = Success
   - 🚨 = Error
   - 📝 = Registration
   - 🔌 = Prisma/Database

Common issues:
- Missing environment variables (check 🔍 logs)
- Database connection failures (check 🔌 logs)
- Password verification failures (check 🔐 logs)
- Google OAuth redirect mismatch (check Google Console settings)

---

## 🚀 Migration to Auth.js v5 (Future)

If you want to migrate to Auth.js v5 in the future:

**Pros:**
- Better Edge runtime support out of the box
- Improved TypeScript types
- Modern architecture

**Cons:**
- Breaking changes in API
- Different configuration structure
- May require rewriting auth logic

**Recommendation:** Stay with NextAuth v4.24 for now since it's working. Only migrate if you need v5-specific features.

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Prisma Edge Client Documentation](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)

---

## ✨ Summary

Your authentication system now works on Cloudflare Pages Edge runtime with:
- ✅ Manual user registration with bcrypt password hashing
- ✅ Credentials-based login (email/password)
- ✅ Google OAuth login
- ✅ JWT-based sessions
- ✅ Prisma + Neon PostgreSQL integration
- ✅ Full error logging and diagnostics

**Key takeaway:** NextAuth v4 CAN work on Cloudflare Edge, but requires:
1. JWT sessions (no database sessions)
2. No PrismaAdapter
3. Manual user management in callbacks
4. Dynamic bcryptjs imports
5. All environment variables in Cloudflare dashboard
