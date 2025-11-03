import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Edge Runtime required for middleware
export const runtime = 'edge'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Allow all NextAuth API routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Get token using next-auth/jwt (lighter than auth())
  const token = await getToken({
    req: req as any,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  })

  // If no token, redirect to sign in
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user is active
  if (!token.active) {
    return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/sync')) {
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
  }

  // Teacher and Admin can delete comments
  if (pathname.startsWith('/api/comments/delete')) {
    if (token.role !== 'ADMIN' && token.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
