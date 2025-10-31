import { prisma } from './prisma';
import type { StudentResponse as PrismaStudentResponse } from '@prisma/client';
import {
  ReportData,
  CategoryStatistics,
  TeachingStatistics,
  OrganizationStatistics,
  ModuleCode,
  EditionCode,
} from '@/types';
import { calculateItemStatistics } from './statistics';
import { calculateTotalEnrolled } from './enrolled-students';

/**
 * Get all responses from PostgreSQL database
 */
export async function getAllResponsesFromDB() {
  return await prisma.studentResponse.findMany({
    where: {
      comentariosDeleted: false, // Only include non-deleted comments
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Get available modules from database
 */
export async function getAvailableModulesFromDB(): Promise<string[]> {
  const modules = await prisma.studentResponse.findMany({
    select: {
      module: true,
    },
    distinct: ['module'],
  });

  const uniqueModules = modules.map(m => m.module).filter(Boolean);

  // Ordenar M1, M2... M9, P1, P2 corretamente
  return uniqueModules.sort((a, b) => {
    const getOrder = (str: string) => {
      const match = str.match(/([MP])(\\d+)/);
      if (!match) return 999;
      const letter = match[1] === 'M' ? 0 : 1; // M antes de P
      const number = parseInt(match[2]);
      return letter * 100 + number;
    };
    return getOrder(a) - getOrder(b);
  });
}

/**
 * Get available editions from database
 */
export async function getAvailableEditionsFromDB(): Promise<string[]> {
  const editions = await prisma.studentResponse.findMany({
    select: {
      edition: true,
    },
    distinct: ['edition'],
  });

  const uniqueEditions = editions.map(e => e.edition).filter(Boolean);

  // Ordenação customizada: Ed1-Ed11, depois Ed1C-Ed3C, depois Ed1CES-Ed2CES
  return uniqueEditions.sort((a, b) => {
    const getOrder = (str: string) => {
      // Remover "Ed" do início
      const code = str.replace('Ed', '');

      // Edições CES: prioridade mais baixa (3000+)
      if (code.includes('CES')) {
        const num = parseInt(code.replace('CES', ''));
        return 3000 + num;
      }

      // Edições C (sem ES): prioridade média (2000+)
      if (code.includes('C')) {
        const num = parseInt(code.replace('C', ''));
        return 2000 + num;
      }

      // Edições numéricas simples: prioridade alta (1000+)
      const num = parseInt(code);
      if (!isNaN(num)) {
        return 1000 + num;
      }

      return 9999;
    };

    return getOrder(a) - getOrder(b);
  });
}

/**
 * Filter responses by module and edition
 */
function filterResponsesFromDB(
  responses: PrismaStudentResponse[],
  module: ModuleCode,
  edition: EditionCode
) {
  return responses.filter(response => {
    const moduleMatch = module === 'ALL' || response.module === module;
    const editionMatch = edition === 'ALL' || response.edition === edition;
    return moduleMatch && editionMatch;
  });
}

/**
 * Calculate discipline statistics from database responses
 */
function calculateDisciplineStatisticsFromDB(responses: PrismaStudentResponse[]): CategoryStatistics {
  return {
    clareza_objetivos: calculateItemStatistics(
      responses.map(r => r.clarezaObjetivos).filter(v => v != null)
    ),
    articulacao_modulos: calculateItemStatistics(
      responses.map(r => r.articulacaoModulos).filter(v => v != null)
    ),
    utilizacao_plataformas: calculateItemStatistics(
      responses.map(r => r.utilizacaoPlataformas).filter(v => v != null)
    ),
    contributo_aquisicao: calculateItemStatistics(
      responses.map(r => r.contributoAquisicao).filter(v => v != null)
    ),
    apreciacao_global_disciplina: calculateItemStatistics(
      responses.map(r => r.apreciacaoGlobalDisciplina).filter(v => v != null)
    ),
  };
}

/**
 * Calculate teaching statistics from database responses
 */
function calculateTeachingStatisticsFromDB(responses: PrismaStudentResponse[]): TeachingStatistics {
  return {
    estruturacao_aulas: calculateItemStatistics(
      responses.map(r => r.estruturacaoAulas).filter(v => v != null)
    ),
    exposicao_conteudos: calculateItemStatistics(
      responses.map(r => r.exposicaoConteudos).filter(v => v != null)
    ),
    dominio_conteudos: calculateItemStatistics(
      responses.map(r => r.dominioConteudos).filter(v => v != null)
    ),
    cumprimento_horario: calculateItemStatistics(
      responses.map(r => r.cumprimentoHorario).filter(v => v != null)
    ),
    disponibilidade_apoio: calculateItemStatistics(
      responses.map(r => r.disponibilidadeApoio).filter(v => v != null)
    ),
    estimulo_participacao: calculateItemStatistics(
      responses.map(r => r.estimuloParticipacao).filter(v => v != null)
    ),
    apreciacao_global_docente: calculateItemStatistics(
      responses.map(r => r.apreciacaoGlobalDocente).filter(v => v != null)
    ),
  };
}

/**
 * Calculate organization statistics from database responses
 */
function calculateOrganizationStatisticsFromDB(responses: PrismaStudentResponse[]): OrganizationStatistics {
  return {
    apoio_equipa_executiva: calculateItemStatistics(
      responses.map(r => r.apoioEquipaExecutiva).filter(v => v != null)
    ),
    organizacao_condicoes_curso: calculateItemStatistics(
      responses.map(r => r.organizacaoCondicoesCurso).filter(v => v != null)
    ),
    instalacoes_equipamentos: calculateItemStatistics(
      responses.map(r => r.instalacoesEquipamentos).filter(v => v != null)
    ),
  };
}

/**
 * Generate report data from database
 */
export async function generateReportDataFromDB(
  module: ModuleCode,
  edition: EditionCode
): Promise<ReportData> {
  const allResponses = await getAllResponsesFromDB();
  const filteredResponses = filterResponsesFromDB(allResponses, module, edition);
  const responseCount = filteredResponses.length;

  // Calcular número de inscritos baseado no módulo e edição
  const totalStudents = calculateTotalEnrolled(module, edition);

  // Filtrar comentários não vazios e que não foram deleted
  const comments = filteredResponses
    .filter(r =>
      r.comentarios &&
      r.comentarios.trim() !== '' &&
      r.comentarios.toLowerCase() !== 'n/a' &&
      !r.comentariosDeleted
    )
    .map(r => ({
      text: r.comentarios as string,
      email: r.email,
      timestamp: r.timestamp.toISOString(),
      module: r.module,
      edition: r.edition,
    }));

  return {
    module,
    edition,
    totalStudents,
    totalResponses: responseCount,
    responseRate: totalStudents > 0 ? Math.round((responseCount / totalStudents) * 100) : 0,
    discipline: calculateDisciplineStatisticsFromDB(filteredResponses),
    teaching: calculateTeachingStatisticsFromDB(filteredResponses),
    organization: calculateOrganizationStatisticsFromDB(filteredResponses),
    comments,
  };
}
