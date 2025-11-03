import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema de validação para alterar password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova password deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de password é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As passwords não coincidem',
  path: ['confirmPassword'],
})

// POST /api/user/change-password - Alterar password do utilizador autenticado
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Buscar utilizador com password atual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Utilizador não tem password definida' },
        { status: 400 }
      )
    }

    // Validar password atual
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password atual incorreta' },
        { status: 400 }
      )
    }

    // Hash da nova password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Atualizar password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CHANGE_PASSWORD',
        tableName: 'User',
        recordId: user.id,
        oldValue: JSON.stringify({ email: user.email }),
        newValue: JSON.stringify({ email: user.email, passwordChanged: true }),
      },
    })

    return NextResponse.json({ message: 'Password alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar password:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao alterar password' },
      { status: 500 }
    )
  }
}
