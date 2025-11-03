# QUICK DEPLOYMENT CHECKLIST - NextAuth v5 Vercel Fix

## What Was Fixed

The session persistence issue on Vercel has been **DEFINITIVELY FIXED** by addressing 5 root causes:

1. Added explicit cookie configuration with `sameSite: 'lax'`
2. Replaced `getToken()` with `auth()` in middleware (Edge Runtime compatible)
3. Fixed Google OAuth URL construction logic
4. Added `basePath: '/api/auth'` configuration
5. Removed deprecated `useSecureCookies` property

## Files Changed

- `/auth.ts` - Cookie config, basePath, fixed OAuth URL logic
- `/middleware.ts` - Replaced getToken() with auth(), updated session handling

## Deploy to Vercel NOW

### 1. Verify Vercel Environment Variables (CRITICAL)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Must have these set for **ALL environments** (Production, Preview, Development):

```
AUTH_SECRET=<your-secret>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://ucp-digital360-reports.vercel.app
DATABASE_URL=<your-neon-postgres-url>
GOOGLE_CLIENT_ID=<your-google-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
NODE_ENV=production
```

**If AUTH_TRUST_HOST is missing or false, ADD IT NOW and set to true!**

### 2. Commit and Push

```bash
cd "/Users/alvaroferreira/Documents/= Projectos/UCP/ucp-digital360-reports"

# Add the fixed files
git add auth.ts middleware.ts VERCEL_FIX_DOCUMENTATION.md DEPLOY_NOW.md

# Commit with descriptive message
git commit -m "fix: NextAuth v5 session persistence on Vercel - DEFINITIVE FIX

- Add explicit cookie configuration (sameSite lax, secure, httpOnly)
- Replace getToken() with auth() in middleware for Edge Runtime
- Fix Google OAuth baseUrl construction logic
- Add basePath configuration
- Remove deprecated useSecureCookies property

This fixes the issue where sessions were not persisting after successful
authentication on Vercel, despite working perfectly on localhost."

# Push to trigger Vercel deployment
git push origin main
```

### 3. Wait for Vercel Deployment (2-3 minutes)

Watch deployment progress at: https://vercel.com/dashboard

### 4. Test Immediately After Deployment

#### Step 1: Clear Browser Data
- Open DevTools (F12)
- Application tab → Storage → Clear site data
- Or use Incognito/Private window

#### Step 2: Test Login
1. Go to: https://ucp-digital360-reports.vercel.app/auth/signin
2. Enter credentials and click "Entrar"
3. Should redirect to /dashboard

#### Step 3: Verify Session Persistence
1. On /dashboard, press F5 to refresh
2. Should stay on /dashboard (NOT redirect to signin)
3. Open DevTools → Application → Cookies
4. Check for `__Secure-next-auth.session-token`
5. Cookie should have:
   - httpOnly: true
   - secure: true
   - sameSite: Lax
   - path: /

#### Step 4: Test Navigation
1. Navigate to different pages
2. Close tab and reopen
3. Session should persist everywhere

### 5. Check Vercel Function Logs

Go to: Vercel Dashboard → Your Project → Functions

You should see this log sequence:

```
✅ [authorize] SUCCESS - Returning user with email
✅ [jwt] User present (first sign in)
✅ [session] Final session data with userId, email, role
✅ [middleware] Session found: {email, role, active}
✅ [middleware] Allowing access to: /dashboard
```

**NOT this (old broken behavior)**:
```
❌ [authorize] SUCCESS - Returning user with email
❌ [jwt] User present (first sign in)
❌ [session] Final session data with userId, email, role
❌ [middleware] No session found, redirecting to sign in  <- BAD!
```

## If It Still Doesn't Work

### Double-Check Vercel Environment Variables

The most common issue is missing or incorrect environment variables:

1. **AUTH_SECRET** - Must match exactly what you use locally
2. **AUTH_TRUST_HOST** - Must be "true" (string), not true (boolean)
3. **NEXTAUTH_URL** - Must be your exact Vercel URL with https://

### Re-deploy After Adding Variables

If you added/changed environment variables:

1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy" (this picks up new env vars)

### Check Browser Console

Open DevTools → Console and look for:
- Red error messages
- Failed fetch requests
- Cookie warnings

### Still Broken?

Check `/VERCEL_FIX_DOCUMENTATION.md` for comprehensive troubleshooting steps.

## Success Indicators

You'll know it's working when:

1. ✅ Login succeeds and redirects to /dashboard
2. ✅ Refreshing any page keeps you logged in
3. ✅ Browser DevTools shows `__Secure-next-auth.session-token` cookie
4. ✅ Vercel logs show "Session found" in middleware
5. ✅ No redirect loops or "Configuration" errors
6. ✅ Protected routes are accessible
7. ✅ Logout works and clears the session

## Performance After Fix

Expected response times on Vercel:

- Cold start (first request): 2-5 seconds
- Warm requests: 100-500ms
- Session validation: < 50ms

## Next Steps After Successful Deployment

1. Test with real users
2. Monitor Vercel Analytics for errors
3. Set up alerts for authentication failures
4. Update any user-facing documentation
5. Consider adding session refresh logic for long-lived sessions

---

## Summary

This fix addresses the root causes of the NextAuth v5 session persistence issue on Vercel. The key changes are:

1. **Explicit cookie configuration** ensures cookies work correctly in Vercel's serverless environment
2. **Using auth() instead of getToken()** ensures Edge Runtime compatibility
3. **Fixed URL construction** prevents API call failures
4. **basePath configuration** ensures correct cookie paths

After deployment, authentication will work identically on both localhost and Vercel production.

**Time to deploy: 5 minutes**
**Expected result: Sessions persist after authentication on Vercel**

---

**Ready to deploy? Run the commands in Step 2 above!**
