import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Tipos para a resposta da API
interface CombinationDiagnostic {
  module: string;
  edition: string;
  responseCount: number;
  hasData: boolean;
}

interface DiagnosticsResponse {
  combinations: CombinationDiagnostic[];
  stats: {
    totalCombinations: number;
    combinationsWithData: number;
    combinationsWithoutData: number;
    coveragePercentage: number;
  };
}

// Todas as combinações possíveis de Módulo/Edição
const ALL_MODULES = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'P1', 'P2'];
const ALL_EDITIONS = ['Ed1', 'Ed2'];

export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se o utilizador é ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores podem aceder a este recurso.' },
        { status: 403 }
      );
    }

    // Buscar todas as respostas agrupadas por módulo e edição
    const responseCounts = await prisma.studentResponse.groupBy({
      by: ['module', 'edition'],
      _count: {
        _all: true,
      },
    });

    // Criar mapa de contagens para acesso rápido
    const countsMap = new Map<string, number>();
    responseCounts.forEach((item) => {
      const key = `${item.module}|${item.edition}`;
      countsMap.set(key, item._count._all);
    });

    // Gerar todas as combinações possíveis
    const combinations: CombinationDiagnostic[] = [];

    for (const moduleCode of ALL_MODULES) {
      for (const editionCode of ALL_EDITIONS) {
        const key = `${moduleCode}|${editionCode}`;
        const count = countsMap.get(key) || 0;

        combinations.push({
          module: moduleCode,
          edition: editionCode,
          responseCount: count,
          hasData: count > 0,
        });
      }
    }

    // Calcular estatísticas
    const combinationsWithData = combinations.filter(c => c.hasData).length;
    const combinationsWithoutData = combinations.filter(c => !c.hasData).length;
    const totalCombinations = combinations.length;
    const coveragePercentage = totalCombinations > 0
      ? parseFloat(((combinationsWithData / totalCombinations) * 100).toFixed(2))
      : 0;

    const response: DiagnosticsResponse = {
      combinations,
      stats: {
        totalCombinations,
        combinationsWithData,
        combinationsWithoutData,
        coveragePercentage,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao obter diagnóstico de cobertura:', error);
    return NextResponse.json(
      { error: 'Erro ao processar diagnóstico de cobertura de dados' },
      { status: 500 }
    );
  }
}
