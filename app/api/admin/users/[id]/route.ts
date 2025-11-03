import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema de validação para atualizar utilizador
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

// PATCH /api/admin/users/[id] - Atualizar utilizador
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Verificar se utilizador existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Prevenir que o admin se desative a si próprio
    if (id === session.user.id && validatedData.active === false) {
      return NextResponse.json(
        { error: 'Não pode desativar a sua própria conta' },
        { status: 400 }
      )
    }

    // Se o email está sendo alterado, verificar se já existe
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
      active: validatedData.active,
    }

    // Se password foi fornecida, fazer hash
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    // Atualizar utilizador
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        action: 'UPDATE_USER',
        tableName: 'User',
        recordId: updatedUser.id,
        oldValue: JSON.stringify(existingUser),
        newValue: JSON.stringify(updatedUser),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar utilizador' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Remover utilizador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { id } = await params

    // Verificar se utilizador existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Prevenir que o admin se remova a si próprio
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Não pode remover a sua própria conta' },
        { status: 400 }
      )
    }

    // Remover utilizador
    await prisma.user.delete({
      where: { id },
    })

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_USER',
        tableName: 'User',
        recordId: id,
        oldValue: JSON.stringify(existingUser),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover utilizador:', error)
    return NextResponse.json(
      { error: 'Erro ao remover utilizador' },
      { status: 500 }
    )
  }
}
