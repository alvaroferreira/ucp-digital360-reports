'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ReportViewer } from '@/components/ReportViewer';
import { PDFExporter } from '@/components/PDFExporter';
import { UserProfile } from '@/components/UserProfile';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModuleCode, EditionCode, ReportData } from '@/types';
import { Loader2, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [module, setModule] = useState<ModuleCode>('ALL');
  const [edition, setEdition] = useState<EditionCode>('ALL');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableEditions, setAvailableEditions] = useState<string[]>([]);

  const isAdmin = session?.user?.role === 'ADMIN';

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/sheets/data?module=${module}&edition=${edition}`
        );

        if (!response.ok) {
          throw new Error('Falha ao carregar dados');
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [module, edition]);

  // Carregar módulos e edições disponíveis ao montar o componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/sheets/modules');
        if (response.ok) {
          const data = await response.json();
          setAvailableModules(data.modules || []);
          setAvailableEditions(data.editions || []);
        }
      } catch (err) {
        console.error('Erro ao carregar opções:', err);
      }
    };

    fetchOptions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com logo UCP */}
      <header className="bg-white border-b border-gray-200 print:border-b-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Logo UCP */}
              <div className="flex-shrink-0">
                <Image
                  src="/ucp-logo.png"
                  alt="Universidade Católica Portuguesa - Porto"
                  width={128}
                  height={48}
                  style={{ width: '128px', height: 'auto' }}
                  priority
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Programa Avançado Digital 360°: da Estratégia à Implementação
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Sistema de Relatórios de Avaliação
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              {isAdmin && (
                <Link href="/admin/users">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Gerir Utilizadores
                  </Button>
                </Link>
              )}
              <UserProfile showFullInfo />
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="edition"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Edição:
                </label>
                <Select
                  id="edition"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value as EditionCode)}
                >
                  <option value="ALL">Todas</option>
                  {availableEditions.map(ed => (
                    <option key={ed} value={ed}>
                      Edição {ed.replace('Ed', '')}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="module"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Módulo:
                </label>
                <Select
                  id="module"
                  value={module}
                  onChange={(e) => setModule(e.target.value as ModuleCode)}
                >
                  {availableModules.map(mod => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                  <option value="ALL">Todos os Módulos</option>
                </Select>
              </div>

              <div>
                <PDFExporter />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo do relatório */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">A carregar dados...</span>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">Erro: {error}</p>
            </CardContent>
          </Card>
        )}

        {reportData && !loading && !error && (
          <ReportViewer data={reportData} />
        )}
      </div>
    </div>
  );
}
