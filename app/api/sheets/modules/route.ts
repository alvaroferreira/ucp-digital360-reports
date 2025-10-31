import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAvailableModulesFromDB, getAvailableEditionsFromDB } from '@/lib/database-processor';

export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter módulos e edições disponíveis do PostgreSQL
    const [modules, editions] = await Promise.all([
      getAvailableModulesFromDB(),
      getAvailableEditionsFromDB(),
    ]);

    return NextResponse.json({ modules, editions });
  } catch (error) {
    console.error('Erro ao obter módulos do PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar módulos disponíveis' },
      { status: 500 }
    );
  }
}
