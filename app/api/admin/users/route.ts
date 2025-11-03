import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema de validação para criar utilizador
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'VIEWER'], {
    message: 'Role inválido'
  }),
  active: z.boolean().default(true),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres'),
})

// GET /api/admin/users - Listar todos os utilizadores
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error)
    return NextResponse.json(
      { error: 'Erro ao listar utilizadores' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Criar novo utilizador
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Verificar se já existe utilizador com este email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um utilizador com este email' },
        { status: 400 }
      )
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Criar novo utilizador
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        active: validatedData.active,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER',
        tableName: 'User',
        recordId: newUser.id,
        newValue: JSON.stringify(newUser),
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar utilizador:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar utilizador' },
      { status: 500 }
    )
  }
}
