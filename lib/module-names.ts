// Mapeamento de códigos de módulos para nomes completos
export const MODULE_NAMES: Record<string, string> = {
  'M1': 'Contexto Estratégico da Transição Digital',
  'M2': 'Cultura Organizacional e Liderança na Era Digital',
  'M3': 'Motivação para a Transformação Digital: Partilha de Casos Práticos',
  'M4': 'Aferição da Proficiência e Reflexão do Grau de Maturidade Digital',
  'M5': 'Marketing e Comunicação Digitais',
  'M6': 'Dados e Informação',
  'M7': 'Confiança e Cibersegurança na Era Digital',
  'M8': 'Soluções Tecnológicas Emergentes',
  'M9': 'Inovação e Modelos de Negócio na Era Digital',
  'P1': 'Conceção Plano transformação Digital',
  'P2': 'Implementação Plano Transformação Digital',
  'ALL': 'Todos os Módulos',
};

export function getModuleName(moduleCode: string): string {
  return MODULE_NAMES[moduleCode] || moduleCode;
}
