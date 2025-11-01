import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Test auth session
    const session = await auth()

    // Get all cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Look for auth cookies
    const authCookies = allCookies.filter(c =>
      c.name.includes('auth') ||
      c.name.includes('session') ||
      c.name.includes('callback')
    )

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      cookies: {
        total: allCookies.length,
        authCookies: authCookies.map(c => ({
          name: c.name,
          value: c.value.substring(0, 20) + '...',
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite
        }))
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}