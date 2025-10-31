import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has permission (ADMIN or TEACHER)
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores e professores podem eliminar comentários.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, commentText } = body;

    if (!email || !commentText) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    console.log('🗑️  Deleting comment:', { email, text: commentText.substring(0, 50) });

    // Find all records matching this email and comment text
    // Use case-insensitive search and trim both values
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedComment = commentText.trim();

    const records = await prisma.studentResponse.findMany({
      where: {
        email: normalizedEmail,
        comentariosDeleted: false, // Only find comments that aren't already deleted
      },
    });

    // Filter in JavaScript to handle exact match after normalization
    const matchingRecords = records.filter(record => {
      const recordComment = (record.comentarios || '').trim();
      return recordComment === normalizedComment;
    });

    console.log(`📊 Found ${matchingRecords.length} matching record(s) for email ${normalizedEmail}`);

    if (matchingRecords.length === 0) {
      console.log('❌ No matching records found');
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    // Mark comment as deleted for all matching records
    const updates = await Promise.all(
      matchingRecords.map(async (record) => {
        const oldValue = record.comentarios;

        await prisma.studentResponse.update({
          where: {
            id: record.id,
          },
          data: {
            comentariosDeleted: true,
          },
        });

        // Create audit log entry
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'COMMENT_DELETED',
            tableName: 'student_responses',
            recordId: record.id,
            oldValue: oldValue || '',
            newValue: '[DELETED]',
          },
        });

        return record.id;
      })
    );

    console.log(`✅ Marked ${updates.length} comment(s) as deleted`);

    return NextResponse.json({ success: true, deletedCount: updates.length });
  } catch (error) {
    console.error('❌ Erro ao deletar comentário:', error);
    return NextResponse.json(
      { error: 'Falha ao deletar comentário' },
      { status: 500 }
    );
  }
}
