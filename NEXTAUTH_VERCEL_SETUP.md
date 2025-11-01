# NextAuth v5 Vercel Deployment Guide

Complete guide for deploying NextAuth v5 credentials authentication on Vercel.

## Critical Changes Made

### 1. auth.ts Configuration

**Added essential Vercel-specific settings:**

```typescript
session: {
  strategy: "jwt",           // MUST be JWT for serverless
  maxAge: 30 * 24 * 60 * 60, // 30 days
}

cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
    },
  },
}

trustHost: true  // CRITICAL for Vercel
```

**Why these changes:**
- Vercel serverless functions don't support database sessions reliably
- Explicit JWT strategy ensures sessions persist correctly
- Cookie configuration prevents cross-domain/CORS issues
- `trustHost: true` allows NextAuth to work with Vercel's dynamic URLs

### 2. Middleware Configuration

**Changed from `getToken()` to `auth()`:**

```typescript
// OLD (doesn't work reliably on Edge Runtime)
const token = await getToken({ req, secret: process.env.AUTH_SECRET })

// NEW (Edge-compatible)
const session = await auth()
```

**Why this matters:**
- Middleware runs on Edge Runtime (required by Next.js)
- `auth()` is optimized for Edge Runtime
- Direct access to full session object, not just token

### 3. Environment Variables

**Required for Vercel:**

```bash
AUTH_SECRET=              # Generate: openssl rand -base64 32
AUTH_TRUST_HOST=true     # MUST be true
NEXTAUTH_URL=            # Your production URL
DATABASE_URL=            # Neon PostgreSQL
```

**Setting in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable for: Production, Preview, Development
3. Redeploy after adding variables

## Deployment Checklist

### Local Testing

1. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update .env.local:**
   ```bash
   AUTH_SECRET=<generated-secret>
   AUTH_TRUST_HOST=true
   NEXTAUTH_URL=http://localhost:6699
   DATABASE_URL=<your-neon-url>
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```
   - Navigate to `/auth/signin`
   - Login with credentials
   - Verify session persists across page refreshes
   - Check console for auth logs

### Vercel Deployment

1. **Set Environment Variables in Vercel:**
   - `AUTH_SECRET` - Same as local
   - `AUTH_TRUST_HOST=true` - CRITICAL
   - `NEXTAUTH_URL=https://your-app.vercel.app`
   - `DATABASE_URL` - Your Neon connection string
   - `GOOGLE_CLIENT_ID` (if using OAuth)
   - `GOOGLE_CLIENT_SECRET` (if using OAuth)
   - `NODE_ENV=production`

2. **Deploy:**
   ```bash
   git push origin main
   # Or use Vercel CLI: vercel --prod
   ```

3. **Verify deployment:**
   - Check deployment logs for errors
   - Test login on production URL
   - Verify cookies are set (check browser DevTools → Application → Cookies)

## Testing Strategy

### 1. Local Testing

```bash
# Start dev server
npm run dev

# Test credentials login
curl -X POST http://localhost:6699/api/auth/signin/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Manual tests:**
- Login with valid credentials
- Login with invalid credentials (should fail gracefully)
- Check session persistence across page refreshes
- Logout and verify session is cleared
- Try accessing protected routes without session

### 2. Vercel Preview Testing

After pushing to a feature branch:
1. Vercel creates preview deployment
2. Test the same flows as local
3. Check Vercel function logs for errors
4. Verify cookies are set correctly

### 3. Production Testing

```bash
# Check if session endpoint works
curl https://your-app.vercel.app/api/auth/session

# Should return session if logged in, or empty if not
```

**Manual production tests:**
1. Clear all cookies
2. Login with credentials
3. Verify redirect to dashboard
4. Refresh page - session should persist
5. Close browser and reopen - session should persist (if maxAge not exceeded)
6. Test admin routes (should require ADMIN role)
7. Logout and verify redirect

## Debugging Common Issues

### Issue: "Configuration" Error

**Symptoms:**
- Login succeeds locally but fails on Vercel
- Error message: "Configuration"
- Session not persisting

**Solution:**
1. Verify `AUTH_TRUST_HOST=true` in Vercel environment variables
2. Check `AUTH_SECRET` is set correctly
3. Ensure `NEXTAUTH_URL` matches your Vercel domain
4. Redeploy after setting variables

### Issue: Session Not Persisting

**Symptoms:**
- Login succeeds
- Redirect happens
- Session lost on next request

**Solution:**
1. Verify cookie configuration in auth.ts
2. Check browser DevTools → Application → Cookies
3. Ensure `secure: true` in production
4. Check for `SameSite` cookie issues
5. Verify middleware is not blocking cookie setting

### Issue: Middleware Infinite Redirect Loop

**Symptoms:**
- Login succeeds
- Redirect to `/auth/signin` immediately
- Infinite loop

**Solution:**
1. Check middleware matcher configuration
2. Ensure `/auth/*` routes are excluded
3. Verify `auth()` function is working in middleware
4. Check console logs for session data

### Issue: Database Connection Errors

**Symptoms:**
- "Can't reach database server"
- Timeout errors
- Works locally, fails on Vercel

**Solution:**
1. Verify Neon connection string is correct
2. Check Neon database is not paused
3. Ensure `?sslmode=require` in connection string
4. Test connection from Vercel function logs
5. Consider connection pooling with Prisma Data Proxy

## Vercel Function Logs

**Viewing logs:**
1. Vercel Dashboard → Your Project → Functions
2. Click on a function to see logs
3. Look for console.log output from auth.ts

**Key logs to check:**
- `[authorize]` - Credential validation
- `[signIn]` - Sign in callback
- `[jwt]` - JWT token creation
- `[session]` - Session creation
- `[middleware]` - Route protection

## Performance Considerations

### Cold Start Optimization

NextAuth v5 with Prisma on Vercel:
- First request (cold start): 2-5 seconds
- Subsequent requests: 100-500ms

**Optimization strategies:**
1. Use connection pooling
2. Enable Prisma Accelerate for edge caching
3. Consider warming functions with cron jobs
4. Optimize Prisma queries (select only needed fields)

### Cookie Size

JWT tokens can get large with custom data:
- Current setup: ~500 bytes (acceptable)
- Max recommended: 4KB
- Monitor: Browser DevTools → Application → Cookies

**If cookies get too large:**
1. Store less data in JWT token
2. Use database lookups instead
3. Implement token refresh strategy

## Security Best Practices

1. **Never commit AUTH_SECRET to git**
2. **Use different AUTH_SECRET for each environment**
3. **Enable CSRF protection (default in NextAuth v5)**
4. **Use HTTPS in production (enforced by Vercel)**
5. **Implement rate limiting for login attempts**
6. **Regular security audits of dependencies**

## Monitoring & Alerting

**Set up monitoring for:**
1. Failed login attempts (potential brute force)
2. Database connection failures
3. Unusual session creation patterns
4. API error rates

**Recommended tools:**
- Vercel Analytics
- Sentry for error tracking
- LogRocket for session replay
- Custom logging to external service

## Rollback Plan

If deployment fails:

1. **Immediate rollback:**
   ```bash
   vercel rollback
   ```

2. **Identify issue:**
   - Check Vercel function logs
   - Review recent code changes
   - Test locally with production env vars

3. **Fix and redeploy:**
   - Fix issue in feature branch
   - Test thoroughly locally
   - Deploy to preview first
   - Then deploy to production

## Support Resources

- NextAuth v5 Docs: https://authjs.dev
- Vercel Docs: https://vercel.com/docs
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Neon Serverless Driver: https://neon.tech/docs/serverless/serverless-driver

## Changelog

### 2025-11-01
- Initial setup with NextAuth v5
- Configured JWT session strategy for Vercel
- Implemented Edge Runtime middleware
- Added comprehensive error handling
- Documented deployment process
