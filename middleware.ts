import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('🛡️  [middleware] Request to:', pathname);

  // Public routes that don't require authentication
  if (pathname.startsWith('/auth/')) {
    console.log('🛡️  [middleware] Public auth route, allowing access');
    return NextResponse.next()
  }

  // Allow internal API calls for user management (used by NextAuth callbacks)
  if (pathname === '/api/auth/user' || pathname.startsWith('/api/auth/')) {
    console.log('🛡️  [middleware] Auth API route, allowing access');
    return NextResponse.next()
  }

  // Get session token
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  })

  // If no session, redirect to sign in
  if (!token) {
    console.log('⚠️  [middleware] No session found, redirecting to sign in');
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  console.log('🛡️  [middleware] Session found:', {
    email: token.email,
    role: token.role,
    active: token.active,
  });

  // Check if user is active
  if (!token.active) {
    console.log('❌ [middleware] User not active, redirecting to unauthorized');
    return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/sync')) {
    console.log('🛡️  [middleware] Admin-only route');
    if (token.role !== 'ADMIN') {
      console.log('❌ [middleware] User is not ADMIN, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
    console.log('✅ [middleware] User is ADMIN, allowing access');
  }

  // Teacher and Admin can delete comments
  if (pathname.startsWith('/api/comments/delete')) {
    console.log('🛡️  [middleware] Comment deletion route');
    if (token.role !== 'ADMIN' && token.role !== 'TEACHER') {
      console.log('❌ [middleware] User is not ADMIN or TEACHER, returning 403');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    console.log('✅ [middleware] User has permission to delete comments');
  }

  console.log('✅ [middleware] Allowing access to:', pathname);
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
}
