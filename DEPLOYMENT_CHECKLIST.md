# 🚀 Cloudflare Pages Deployment Checklist

Use this checklist to ensure your NextAuth deployment succeeds.

---

## ☑️ Pre-Deployment

- [ ] Review all code changes in `AUTH_FIX_SUMMARY.md`
- [ ] Understand root causes in `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- [ ] Commit all changes to git
- [ ] Push to your main branch

---

## ☑️ Cloudflare Environment Variables

Navigate to: **Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables**

Set these for **Production** environment:

- [ ] `DATABASE_URL` = Your Neon PostgreSQL connection string
  - Example: `postgresql://user:pass@host.region.neon.tech/dbname?sslmode=require`
  
- [ ] `NEXTAUTH_SECRET` = Random 32+ character string
  - Generate: `openssl rand -base64 32`
  - Example: `YourVerySecureRandomString123456789ABC`
  
- [ ] `NEXTAUTH_URL` = `https://rarecomforts.in`
  - ⚠️ No trailing slash!
  - ⚠️ Must match Google OAuth config exactly
  
- [ ] `GOOGLE_CLIENT_ID` = Your Google OAuth Client ID
  - From Google Cloud Console → Credentials
  - Example: `123456789-abc123def456.apps.googleusercontent.com`
  
- [ ] `GOOGLE_CLIENT_SECRET` = Your Google OAuth Client Secret
  - From Google Cloud Console → Credentials
  - Example: `GOCSPX-your_secret_here`

**Save and redeploy if you just added these!**

---

## ☑️ Google Cloud Console

Navigate to: **[Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Your OAuth 2.0 Client**

### Authorized JavaScript Origins:
- [ ] Add: `https://rarecomforts.in`
  - ⚠️ No trailing slash!
  - ⚠️ HTTPS only (not HTTP)

### Authorized Redirect URIs:
- [ ] Add: `https://rarecomforts.in/api/auth/callback/google`
  - ⚠️ Must match exactly (no typos!)
  - ⚠️ Path is `/api/auth/callback/google`

- [ ] Click **Save** in Google Cloud Console

---

## ☑️ Database (Neon)

- [ ] Database is not paused/sleeping
- [ ] Connection string in `DATABASE_URL` is correct
- [ ] IP allowlist allows all IPs (or includes Cloudflare IPs)
- [ ] SSL mode is enabled (`?sslmode=require` in connection string)
- [ ] Test connection: `psql $DATABASE_URL` (should connect)

---

## ☑️ Deployment

- [ ] Code pushed to main branch
- [ ] Cloudflare Pages triggered automatic deployment
  - Or manually: **Dashboard → Pages → Your Project → Deployments → Retry**
- [ ] Deployment shows "Success" status
- [ ] No build errors in deployment logs

---

## ☑️ Post-Deployment Testing

### 1. Health Check
```bash
curl https://rarecomforts.in/api/health
```

**Expected response:**
```json
{
  "status": "✅ Healthy",
  "checks": {
    "environment": {
      "DATABASE_URL": "✅ SET",
      "NEXTAUTH_SECRET": "✅ SET",
      "NEXTAUTH_URL": "✅ https://rarecomforts.in",
      "GOOGLE_CLIENT_ID": "✅ SET",
      "GOOGLE_CLIENT_SECRET": "✅ SET"
    },
    "database": {
      "status": "✅ Connected"
    }
  }
}
```

- [ ] All environment variables show "✅ SET"
- [ ] Database status is "✅ Connected"
- [ ] Overall status is "✅ Healthy"

**If not healthy:** Fix issues before proceeding

---

### 2. Session Endpoint
```bash
curl https://rarecomforts.in/api/auth/session
```

**Expected response:**
```json
{}
```
or
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "image": "..."
  },
  "expires": "..."
}
```

- [ ] Returns valid JSON (not "Internal Server Error")
- [ ] No 500 error
- [ ] Response is either empty object or user session

---

### 3. Providers Endpoint
```bash
curl https://rarecomforts.in/api/auth/providers
```

**Expected response:**
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "...",
    "callbackUrl": "..."
  },
  "credentials": {
    "id": "credentials",
    "name": "credentials",
    "type": "credentials"
  }
}
```

- [ ] Returns valid JSON
- [ ] Shows both "google" and "credentials" providers
- [ ] No 500 error

---

### 4. Registration Test
```bash
curl -X POST https://rarecomforts.in/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "User successfully registered.",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

- [ ] Returns 201 status code
- [ ] Returns valid JSON with user data
- [ ] No 500 error
- [ ] User appears in database: `SELECT * FROM "User" WHERE email = 'test@example.com'`

---

### 5. Credentials Login Test (Browser)

1. Visit: `https://rarecomforts.in/auth`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `testpass123`
3. Click "Sign In"

- [ ] No 500 error
- [ ] Redirects after successful login
- [ ] Session cookie is set
- [ ] `/api/auth/session` returns user data

---

### 6. Google OAuth Test (Browser)

1. Visit: `https://rarecomforts.in/auth`
2. Click "Sign in with Google"
3. Complete Google consent screen

- [ ] Redirects to Google successfully
- [ ] Google shows OAuth consent screen
- [ ] Redirects back to your site after consent
- [ ] No "redirect_uri_mismatch" error
- [ ] No 500 error
- [ ] Session cookie is set
- [ ] User created in database
- [ ] `/api/auth/session` returns user data

---

## ☑️ Cloudflare Functions Logs Review

Navigate to: **Cloudflare Dashboard → Pages → Your Project → Functions**

Look for:

- [ ] No 500 errors in logs
- [ ] See emoji markers (🔐, ✅, 🚨, 📝, 🔌)
- [ ] Database connection logs show "✅ Connected"
- [ ] Environment variable logs show all as "✅ SET"
- [ ] No "Missing environment variable" errors
- [ ] No Prisma adapter errors
- [ ] No bcrypt errors

---

## ☑️ Common Issues & Solutions

### ❌ Health check shows missing environment variables
**Solution:** Add them in Cloudflare dashboard, trigger new deployment

### ❌ Health check shows database connection failed
**Solution:** 
- Check DATABASE_URL is correct
- Verify Neon database is not paused
- Check IP allowlist in Neon
- Test: `psql $DATABASE_URL`

### ❌ Google OAuth shows "redirect_uri_mismatch"
**Solution:**
- Verify redirect URI in Google Console: `https://rarecomforts.in/api/auth/callback/google`
- Verify NEXTAUTH_URL: `https://rarecomforts.in`
- Both must match exactly (no trailing slashes)
- Wait 5 minutes after updating Google Console settings

### ❌ Registration returns 500 error
**Solution:**
- Check Cloudflare Functions logs for specific error
- Verify DATABASE_URL is set
- Test database connection via health endpoint
- Check bcrypt errors in logs

### ❌ Credentials login fails with "Invalid credentials"
**Solution:**
- Verify user exists in database
- Check password was hashed during registration
- Review Cloudflare logs for password verification errors
- Try registering a new user

### ❌ Session endpoint returns "Internal Server Error"
**Solution:**
- Check NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL is set
- Review Cloudflare Functions logs
- Check health endpoint first

---

## ☑️ Success Criteria

All of the following should be ✅:

- [ ] `/api/health` returns healthy status
- [ ] `/api/auth/session` returns JSON (not error text)
- [ ] `/api/auth/providers` returns JSON with two providers
- [ ] `/api/register` successfully creates users
- [ ] Credentials login works (email/password)
- [ ] Google OAuth login works
- [ ] No 500 errors anywhere
- [ ] Cloudflare logs show no critical errors

---

## 🎉 If All Checks Pass

**Congratulations!** Your authentication system is live and working on Cloudflare Pages.

### Next Steps:
1. Test with real user accounts
2. Monitor Cloudflare Functions logs for errors
3. Set up error alerting (Cloudflare Email Workers)
4. Configure rate limiting on auth endpoints
5. Set up session monitoring

### Optional Enhancements:
- Add forgot password flow (requires email service)
- Add email verification (requires email service)
- Add 2FA support
- Add session management UI
- Add user profile management

---

## 📚 Additional Resources

- `AUTH_FIX_SUMMARY.md` - Technical details of all changes
- `CLOUDFLARE_DEPLOYMENT_GUIDE.md` - Complete architecture guide
- Cloudflare Functions Logs - Real-time debugging
- `/api/health` - Environment and database status

---

## 🆘 Still Having Issues?

1. Review Cloudflare Functions logs (most errors show here)
2. Check `/api/health` endpoint for configuration issues
3. Verify all environment variables are set correctly
4. Test Google OAuth configuration with a different account
5. Try in incognito mode (clears cookies)
6. Check this exact checklist item by item

**Most common mistake:** Forgetting to add environment variables in Cloudflare dashboard after pushing code.

---

**Good luck with your deployment! 🚀**
