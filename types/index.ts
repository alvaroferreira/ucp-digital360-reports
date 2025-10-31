// Tipos de dados para o sistema de relatórios

export type ModuleCode = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'P1' | 'P2' | 'ALL';
export type EditionCode = 'Ed1' | 'Ed2' | 'ALL';

// Resposta individual de um estudante
export interface StudentResponse {
  timestamp: string;
  email: string;
  module: string;
  edition: string;

  // Avaliação da Disciplina (1-7)
  clareza_objetivos: number;
  articulacao_modulos: number;
  utilizacao_plataformas: number;
  contributo_aquisicao: number;
  apreciacao_global_disciplina: number;

  // Avaliação Docente (1-7)
  estruturacao_aulas: number;
  exposicao_conteudos: number;
  dominio_conteudos: number;
  cumprimento_horario: number;
  disponibilidade_apoio: number;
  estimulo_participacao: number;
  apreciacao_global_docente: number;

  // Avaliação da Organização (1-7)
  apoio_equipa_executiva: number;
  organizacao_condicoes_curso: number;
  instalacoes_equipamentos: number;

  // Comentários e sugestões
  comentarios: string;
}

// Estatísticas calculadas para cada item
export interface ItemStatistics {
  n: number; // número de respostas
  media: number; // média
  dp: number; // desvio padrão
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
    '7': number;
  };
}

// Estatísticas agregadas para uma categoria
export interface CategoryStatistics {
  // Avaliação da Disciplina
  clareza_objetivos: ItemStatistics;
  articulacao_modulos: ItemStatistics;
  utilizacao_plataformas: ItemStatistics;
  contributo_aquisicao: ItemStatistics;
  apreciacao_global_disciplina: ItemStatistics;
}

export interface TeachingStatistics {
  // Avaliação Docente
  estruturacao_aulas: ItemStatistics;
  exposicao_conteudos: ItemStatistics;
  dominio_conteudos: ItemStatistics;
  cumprimento_horario: ItemStatistics;
  disponibilidade_apoio: ItemStatistics;
  estimulo_participacao: ItemStatistics;
  apreciacao_global_docente: ItemStatistics;
}

export interface OrganizationStatistics {
  // Avaliação da Organização
  apoio_equipa_executiva: ItemStatistics;
  organizacao_condicoes_curso: ItemStatistics;
  instalacoes_equipamentos: ItemStatistics;
}

// Comentário com metadados para permitir remoção
export interface Comment {
  text: string;
  email: string; // Identificador único do estudante
  timestamp: string;
  module: string;
  edition: string;
}

// Dados completos do relatório
export interface ReportData {
  module: ModuleCode;
  edition: EditionCode;
  totalStudents: number; // inscritos
  totalResponses: number; // respostas válidas
  responseRate: number; // taxa de resposta (%)

  discipline: CategoryStatistics;
  teaching: TeachingStatistics;
  organization: OrganizationStatistics;
  comments: Comment[]; // Lista de comentários não vazios com metadados
}

// Dados brutos do Google Sheets
export interface SheetData {
  range: string;
  values: any[][];
}

// Filtros aplicados
export interface ReportFilters {
  module: ModuleCode;
  edition: EditionCode;
}
