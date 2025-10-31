import { ItemStatistics } from '@/types';

/**
 * Calcula a média de um array de números
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calcula o desvio padrão de um array de números
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDiffs);

  return Math.sqrt(variance);
}

/**
 * Calcula a distribuição de frequências para valores de 1 a 7
 */
export function calculateDistribution(values: number[]): {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number;
  '7': number;
} {
  const distribution = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
  };

  values.forEach(value => {
    if (value >= 1 && value <= 7) {
      distribution[value.toString() as keyof typeof distribution]++;
    }
  });

  return distribution;
}

/**
 * Calcula todas as estatísticas para um item específico
 */
export function calculateItemStatistics(values: number[]): ItemStatistics {
  // Filtrar valores válidos (1-7)
  const validValues = values.filter(v => v >= 1 && v <= 7);

  return {
    n: validValues.length,
    media: Number(calculateMean(validValues).toFixed(2)),
    dp: Number(calculateStandardDeviation(validValues).toFixed(2)),
    distribution: calculateDistribution(validValues),
  };
}

/**
 * Formata a taxa de resposta como percentagem
 */
export function formatResponseRate(responses: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((responses / total) * 100);
}
