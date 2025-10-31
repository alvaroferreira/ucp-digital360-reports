import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateReportDataFromDB } from '@/lib/database-processor';
import { ModuleCode, EditionCode } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter parâmetros da query
    const searchParams = request.nextUrl.searchParams;
    const module = (searchParams.get('module') || 'ALL') as ModuleCode;
    const edition = (searchParams.get('edition') || 'ALL') as EditionCode;

    console.log(`📊 Carregando dados do PostgreSQL para módulo: ${module}, edição: ${edition}`);

    // Gerar dados do relatório diretamente do PostgreSQL
    const reportData = await generateReportDataFromDB(module, edition);

    console.log(`✅ Dados carregados: ${reportData.totalResponses} respostas`);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('❌ Erro ao obter dados do PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar dados do PostgreSQL' },
      { status: 500 }
    );
  }
}
