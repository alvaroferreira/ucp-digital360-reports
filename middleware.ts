import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// CRITICAL: Use Edge Runtime for middleware (required by Next.js)
export const runtime = 'experimental-edge'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('🛡️  [middleware] Request to:', pathname);

  // Public routes that don't require authentication
  if (pathname.startsWith('/auth/')) {
    console.log('🛡️  [middleware] Public auth route, allowing access');
    return NextResponse.next()
  }

  // Allow all NextAuth API routes (they handle their own auth)
  if (pathname.startsWith('/api/auth/')) {
    console.log('🛡️  [middleware] Auth API route, allowing access');
    return NextResponse.next()
  }

  // Get session using NextAuth's auth() function (Edge-compatible)
  const session = await auth()

  // If no session, redirect to sign in
  if (!session || !session.user) {
    console.log('⚠️  [middleware] No session found, redirecting to sign in');
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  console.log('🛡️  [middleware] Session found:', {
    email: session.user.email,
    role: session.user.role,
    active: session.user.active,
  });

  // Check if user is active
  if (!session.user.active) {
    console.log('❌ [middleware] User not active, redirecting to unauthorized');
    return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/sync')) {
    console.log('🛡️  [middleware] Admin-only route');
    if (session.user.role !== 'ADMIN') {
      console.log('❌ [middleware] User is not ADMIN, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
    console.log('✅ [middleware] User is ADMIN, allowing access');
  }

  // Teacher and Admin can delete comments
  if (pathname.startsWith('/api/comments/delete')) {
    console.log('🛡️  [middleware] Comment deletion route');
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      console.log('❌ [middleware] User is not ADMIN or TEACHER, returning 403');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    console.log('✅ [middleware] User has permission to delete comments');
  }

  console.log('✅ [middleware] Allowing access to:', pathname);
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
