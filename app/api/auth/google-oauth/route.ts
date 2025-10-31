import { NextResponse } from 'next/server';
import { auth, signIn } from '@/auth';

/**
 * Rota para iniciar OAuth do Google apenas para admins
 * Esta rota é protegida e só permite que admins renovem tokens OAuth
 */
export async function GET() {
  try {
    const session = await auth();

    // Verificar se está autenticado e é admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem renovar tokens OAuth.' },
        { status: 403 }
      );
    }

    // Redirecionar para Google OAuth
    return await signIn('google', { redirectTo: '/admin/sync' });
  } catch (error) {
    console.error('Erro ao iniciar OAuth:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação OAuth' },
      { status: 500 }
    );
  }
}
