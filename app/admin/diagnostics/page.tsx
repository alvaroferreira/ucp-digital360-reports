'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader2,
  X,
  Check,
  Filter,
  Info,
} from 'lucide-react';

// Tipos para os dados da API
interface CombinationDiagnostic {
  module: string;
  edition: string;
  responseCount: number;
  hasData: boolean;
}

interface DiagnosticsStats {
  totalCombinations: number;
  combinationsWithData: number;
  combinationsWithoutData: number;
  coveragePercentage: number;
}

interface DiagnosticsData {
  combinations: CombinationDiagnostic[];
  stats: DiagnosticsStats;
}

// Módulos e edições disponíveis
const ALL_MODULES = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'P1', 'P2'];
const ALL_EDITIONS = ['Ed1', 'Ed2'];

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [showOnlyWithoutData, setShowOnlyWithoutData] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedEdition, setSelectedEdition] = useState<string>('ALL');

  // Combinação selecionada para mostrar detalhes
  const [selectedCombination, setSelectedCombination] = useState<CombinationDiagnostic | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/diagnostics');
      if (!response.ok) {
        throw new Error('Failed to fetch diagnostics data');
      }

      const diagnosticsData: DiagnosticsData = await response.json();
      setData(diagnosticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e ordenar combinações
  const filteredCombinations = useMemo(() => {
    if (!data) return [];

    let filtered = [...data.combinations];

    // Filtro: apenas sem dados
    if (showOnlyWithoutData) {
      filtered = filtered.filter(c => !c.hasData);
    }

    // Filtro: módulo específico
    if (selectedModule !== 'ALL') {
      filtered = filtered.filter(c => c.module === selectedModule);
    }

    // Filtro: edição específica
    if (selectedEdition !== 'ALL') {
      filtered = filtered.filter(c => c.edition === selectedEdition);
    }

    // Ordenação: primeiro sem dados, depois por módulo e edição
    filtered.sort((a, b) => {
      // Primeiro critério: sem dados vêm primeiro
      if (a.hasData !== b.hasData) {
        return a.hasData ? 1 : -1;
      }

      // Segundo critério: ordenar por módulo
      const moduleComparison = a.module.localeCompare(b.module);
      if (moduleComparison !== 0) {
        return moduleComparison;
      }

      // Terceiro critério: ordenar por edição
      return a.edition.localeCompare(b.edition);
    });

    return filtered;
  }, [data, showOnlyWithoutData, selectedModule, selectedEdition]);

  const handleCombinationClick = (combination: CombinationDiagnostic) => {
    if (!combination.hasData) {
      setSelectedCombination(combination);
    }
  };

  const handleCloseAlert = () => {
    setSelectedCombination(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Erro ao carregar dados:</span>
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Combinações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total de Combinações
            </CardTitle>
            <LayoutGrid className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.stats.totalCombinations}</div>
            <p className="text-xs text-gray-500 mt-1">
              Módulos × Edições
            </p>
          </CardContent>
        </Card>

        {/* Combinações com Dados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Com Dados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.combinationsWithData}</div>
            <p className="text-xs text-gray-500 mt-1">
              Combinações com respostas
            </p>
          </CardContent>
        </Card>

        {/* Combinações sem Dados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Sem Dados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.stats.combinationsWithoutData}</div>
            <p className="text-xs text-gray-500 mt-1">
              Combinações sem respostas
            </p>
          </CardContent>
        </Card>

        {/* Percentagem de Cobertura */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Cobertura
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.coveragePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Combinações preenchidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de Combinação sem Dados */}
      {selectedCombination && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">
                    {selectedCombination.module} - {selectedCombination.edition}
                  </h3>
                  <p className="text-sm text-orange-800">
                    Esta combinação ainda não tem respostas. Verifique se o módulo já foi lecionado
                    ou se há problemas com o formulário Google Forms.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCloseAlert}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 hover:bg-orange-100"
              >
                <X className="w-4 h-4 text-orange-600" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Combinações Módulo/Edição</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {filteredCombinations.length} de {data.combinations.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de Filtro */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Toggle: Mostrar apenas sem dados */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithoutData}
                onChange={(e) => setShowOnlyWithoutData(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mostrar apenas sem dados
              </span>
            </label>

            {/* Filtro por Módulo */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Módulo:</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Todos</option>
                {ALL_MODULES.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Edição */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Edição:</label>
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Todas</option>
                {ALL_EDITIONS.map((edition) => (
                  <option key={edition} value={edition}>
                    {edition}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Reset */}
            {(showOnlyWithoutData || selectedModule !== 'ALL' || selectedEdition !== 'ALL') && (
              <Button
                onClick={() => {
                  setShowOnlyWithoutData(false);
                  setSelectedModule('ALL');
                  setSelectedEdition('ALL');
                }}
                variant="outline"
                size="sm"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Módulo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Edição</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Nº Respostas</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCombinations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhuma combinação encontrada com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredCombinations.map((combination) => (
                    <tr
                      key={`${combination.module}-${combination.edition}`}
                      onClick={() => handleCombinationClick(combination)}
                      className={`
                        border-b border-gray-100
                        transition-colors
                        ${!combination.hasData ? 'hover:bg-red-50 cursor-pointer' : 'hover:bg-gray-50'}
                      `}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {combination.module}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {combination.edition}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {combination.responseCount}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          {combination.hasData ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <Check className="w-5 h-5" />
                              <span className="text-xs font-medium">Com dados</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-600">
                              <X className="w-5 h-5" />
                              <span className="text-xs font-medium">Sem dados</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-6 text-xs text-gray-600 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>Combinação com respostas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <X className="w-4 h-4 text-red-600" />
              <span>Combinação sem respostas (clique para mais informações)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
