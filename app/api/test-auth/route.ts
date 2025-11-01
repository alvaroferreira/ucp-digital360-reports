import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🧪 [test-auth] Testing authentication for:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email
      }, { status: 404 })
    }

    console.log('🧪 [test-auth] User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      role: user.role,
      active: user.active
    })

    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          active: user.active
        }
      }, { status: 400 })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)

    console.log('🧪 [test-auth] Password valid:', isValid)

    return NextResponse.json({
      success: true,
      passwordValid: isValid,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active,
        hasPassword: !!user.password
      }
    })

  } catch (error) {
    console.error('🧪 [test-auth] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
