// Mapeamento de número de estudantes inscritos por módulo e edição
// Este mapeamento deve ser atualizado manualmente com os dados reais de inscrições

type EnrollmentKey = `${string}-${string}`; // "M1-Ed1", "M2-Ed2", etc.

export const ENROLLED_STUDENTS: Record<EnrollmentKey, number> = {
  // Edição 1
  'M1-Ed1': 447,
  'M2-Ed1': 0,
  'M3-Ed1': 0,
  'M4-Ed1': 0,
  'M5-Ed1': 0,
  'M6-Ed1': 0,
  'M7-Ed1': 0,
  'M8-Ed1': 0,
  'M9-Ed1': 0,
  'P1-Ed1': 0,
  'P2-Ed1': 0,

  // Edição 2
  'M1-Ed2': 0,
  'M2-Ed2': 0,
  'M3-Ed2': 0,
  'M4-Ed2': 0,
  'M5-Ed2': 0,
  'M6-Ed2': 0,
  'M7-Ed2': 0,
  'M8-Ed2': 0,
  'M9-Ed2': 0,
  'P1-Ed2': 0,
  'P2-Ed2': 0,

  // Adicionar mais edições conforme necessário
};

/**
 * Obtém o número de estudantes inscritos para um módulo e edição específicos
 */
export function getEnrolledStudents(module: string, edition: string): number {
  const key: EnrollmentKey = `${module}-${edition}`;
  return ENROLLED_STUDENTS[key] || 0;
}

/**
 * Calcula o número total de inscritos para uma combinação de filtros
 * Se for "ALL", soma todos os valores correspondentes
 */
export function calculateTotalEnrolled(module: string, edition: string): number {
  if (module === 'ALL' && edition === 'ALL') {
    // Soma todos os inscritos
    return Object.values(ENROLLED_STUDENTS).reduce((sum, val) => sum + val, 0);
  }

  if (module === 'ALL') {
    // Soma todos os módulos de uma edição específica
    return Object.entries(ENROLLED_STUDENTS)
      .filter(([key]) => key.endsWith(`-${edition}`))
      .reduce((sum, [, val]) => sum + val, 0);
  }

  if (edition === 'ALL') {
    // Soma todas as edições de um módulo específico
    return Object.entries(ENROLLED_STUDENTS)
      .filter(([key]) => key.startsWith(`${module}-`))
      .reduce((sum, [, val]) => sum + val, 0);
  }

  // Módulo e edição específicos
  return getEnrolledStudents(module, edition);
}
