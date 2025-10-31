import {
  StudentResponse,
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
 * Processa dados brutos do Google Sheets para o formato StudentResponse
 * Assume que a primeira linha contém headers
 *
 * Estrutura da Base_Dados:
 * A: Timestamp
 * B: Email Address
 * C: Qual é a sua Edição? (1, 2, etc)
 * D: Módulo (M1, M2, etc)
 * E-P: Perguntas de avaliação 1.1 a 2.7
 * Q-S: Perguntas de avaliação 3.1 a 3.3 (Organização)
 * T: Comentários e sugestões
 */
/**
 * Valida e parseia timestamp do Google Sheets
 * Retorna string ISO válida ou data atual se inválido
 */
function parseTimestamp(timestampValue: any): string {
  if (!timestampValue) {
    console.warn('⚠️  Timestamp vazio, usando data atual');
    return new Date().toISOString();
  }

  const parsed = new Date(timestampValue);
  if (isNaN(parsed.getTime())) {
    console.warn(`⚠️  Timestamp inválido: "${timestampValue}", usando data atual`);
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function parseSheetData(rows: any[][]): StudentResponse[] {
  if (!rows || rows.length < 2) return [];

  const dataRows = rows.slice(1); // Pular header

  return dataRows.map(row => {
    // Converter edição "1" para "Ed1", "2" para "Ed2", etc
    const edicaoNum = row[2] || '1';
    const edition = `Ed${edicaoNum}`;

    const email = row[1] || ''; // Coluna B: Email Address

    return {
      timestamp: parseTimestamp(row[0]),
      email: email,
      module: row[3] || '', // Coluna D: Módulo
      edition: edition, // Coluna C: Edição (convertida)

      // Avaliação da Disciplina (Colunas E-I: índices 4-8)
      clareza_objetivos: parseInt(row[4]) || 0,
      articulacao_modulos: parseInt(row[5]) || 0,
      utilizacao_plataformas: parseInt(row[6]) || 0,
      contributo_aquisicao: parseInt(row[7]) || 0,
      apreciacao_global_disciplina: parseInt(row[8]) || 0,

      // Avaliação Docente (Colunas J-P: índices 9-15)
      estruturacao_aulas: parseInt(row[9]) || 0,
      exposicao_conteudos: parseInt(row[10]) || 0,
      dominio_conteudos: parseInt(row[11]) || 0,
      cumprimento_horario: parseInt(row[12]) || 0,
      disponibilidade_apoio: parseInt(row[13]) || 0,
      estimulo_participacao: parseInt(row[14]) || 0,
      apreciacao_global_docente: parseInt(row[15]) || 0,

      // Avaliação da Organização (Colunas Q-S: índices 16-18)
      apoio_equipa_executiva: parseInt(row[16]) || 0,
      organizacao_condicoes_curso: parseInt(row[17]) || 0,
      instalacoes_equipamentos: parseInt(row[18]) || 0,

      // Comentários e sugestões (Coluna T: índice 19)
      comentarios: row[19] || '',
    };
  });
}

/**
 * Filtra respostas por módulo e edição
 */
export function filterResponses(
  responses: StudentResponse[],
  module: ModuleCode,
  edition: EditionCode
): StudentResponse[] {
  return responses.filter(response => {
    const moduleMatch = module === 'ALL' || response.module === module;
    const editionMatch = edition === 'ALL' || response.edition === edition;
    return moduleMatch && editionMatch;
  });
}

/**
 * Calcula estatísticas para avaliação da disciplina
 */
export function calculateDisciplineStatistics(
  responses: StudentResponse[]
): CategoryStatistics {
  return {
    clareza_objetivos: calculateItemStatistics(
      responses.map(r => r.clareza_objetivos)
    ),
    articulacao_modulos: calculateItemStatistics(
      responses.map(r => r.articulacao_modulos)
    ),
    utilizacao_plataformas: calculateItemStatistics(
      responses.map(r => r.utilizacao_plataformas)
    ),
    contributo_aquisicao: calculateItemStatistics(
      responses.map(r => r.contributo_aquisicao)
    ),
    apreciacao_global_disciplina: calculateItemStatistics(
      responses.map(r => r.apreciacao_global_disciplina)
    ),
  };
}

/**
 * Calcula estatísticas para avaliação docente
 */
export function calculateTeachingStatistics(
  responses: StudentResponse[]
): TeachingStatistics {
  return {
    estruturacao_aulas: calculateItemStatistics(
      responses.map(r => r.estruturacao_aulas)
    ),
    exposicao_conteudos: calculateItemStatistics(
      responses.map(r => r.exposicao_conteudos)
    ),
    dominio_conteudos: calculateItemStatistics(
      responses.map(r => r.dominio_conteudos)
    ),
    cumprimento_horario: calculateItemStatistics(
      responses.map(r => r.cumprimento_horario)
    ),
    disponibilidade_apoio: calculateItemStatistics(
      responses.map(r => r.disponibilidade_apoio)
    ),
    estimulo_participacao: calculateItemStatistics(
      responses.map(r => r.estimulo_participacao)
    ),
    apreciacao_global_docente: calculateItemStatistics(
      responses.map(r => r.apreciacao_global_docente)
    ),
  };
}

/**
 * Calcula estatísticas para avaliação da organização
 */
export function calculateOrganizationStatistics(
  responses: StudentResponse[]
): OrganizationStatistics {
  return {
    apoio_equipa_executiva: calculateItemStatistics(
      responses.map(r => r.apoio_equipa_executiva)
    ),
    organizacao_condicoes_curso: calculateItemStatistics(
      responses.map(r => r.organizacao_condicoes_curso)
    ),
    instalacoes_equipamentos: calculateItemStatistics(
      responses.map(r => r.instalacoes_equipamentos)
    ),
  };
}

/**
 * Gera dados completos do relatório
 */
export function generateReportData(
  allResponses: StudentResponse[],
  module: ModuleCode,
  edition: EditionCode
): ReportData {
  const filteredResponses = filterResponses(allResponses, module, edition);
  const responseCount = filteredResponses.length;

  // Calcular número de inscritos baseado no módulo e edição
  const totalStudents = calculateTotalEnrolled(module, edition);

  // Filtrar comentários não vazios e incluir metadados
  const comments = filteredResponses
    .filter(r => r.comentarios && r.comentarios.trim() !== '' && r.comentarios.toLowerCase() !== 'n/a')
    .map(r => ({
      text: r.comentarios,
      email: r.email,
      timestamp: r.timestamp,
      module: r.module,
      edition: r.edition,
    }));

  return {
    module,
    edition,
    totalStudents,
    totalResponses: responseCount,
    responseRate: totalStudents > 0 ? Math.round((responseCount / totalStudents) * 100) : 0,
    discipline: calculateDisciplineStatistics(filteredResponses),
    teaching: calculateTeachingStatistics(filteredResponses),
    organization: calculateOrganizationStatistics(filteredResponses),
    comments,
  };
}
