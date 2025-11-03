'use client';

import { useState } from 'react';
import { ReportData, Comment } from '@/types';
import { ReportTable } from './ReportTable';
import { ReportCharts } from './ReportCharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getModuleName } from '@/lib/module-names';
import { X, Loader2 } from 'lucide-react';

interface ReportViewerProps {
  data: ReportData;
}

export function ReportViewer({ data }: ReportViewerProps) {
  // Estado local para gerir comentários (permite remoção)
  const [comments, setComments] = useState<Comment[]>(data.comments);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Função para remover um comentário permanentemente
  const removeComment = async (index: number) => {
    const comment = comments[index];
    setDeletingIndex(index);

    console.log('Removendo comentário:', {
      email: comment.email,
      text: comment.text.substring(0, 50)
    });

    try {
      const response = await fetch('/api/comments/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: comment.email,
          commentText: comment.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao remover comentário');
      }

      // Remover do estado local após sucesso
      setComments(comments.filter((_, i) => i !== index));
      console.log('✅ Comentário removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao remover comentário:', error);
      alert(`Erro ao remover comentário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDeletingIndex(null);
    }
  };

  // Preparar dados para a tabela de Avaliação da Disciplina
  const disciplineItems = [
    {
      label: '1.1 Clareza dos objetivos e do programa da unidade curricular',
      stats: data.discipline.clareza_objetivos,
    },
    {
      label: '1.2 Articulação entre temáticas dos diferentes módulos sem sobreposição de conteúdos',
      stats: data.discipline.articulacao_modulos,
    },
    {
      label: '1.3 Utilização das plataformas digitais de ensino e aprendizagem (Blackboard, Zoom, Miro)',
      stats: data.discipline.utilizacao_plataformas,
    },
    {
      label: '1.4 Contributo para aquisição de novos conhecimentos',
      stats: data.discipline.contributo_aquisicao,
    },
    {
      label: '1.5 Apreciação global da unidade curricular',
      stats: data.discipline.apreciacao_global_disciplina,
    },
  ];

  // Preparar dados para a tabela de Avaliação Docente
  const teachingItems = [
    {
      label: '2.1 Estruturação e dinâmica das aulas',
      stats: data.teaching.estruturacao_aulas,
    },
    {
      label: '2.2 Exposição e a abordagem dos conteúdos',
      stats: data.teaching.exposicao_conteudos,
    },
    {
      label: '2.3 Domínio dos conteúdos e capacidade de os transmitir',
      stats: data.teaching.dominio_conteudos,
    },
    {
      label: '2.4 Cumprimento do horário estabelecido',
      stats: data.teaching.cumprimento_horario,
    },
    {
      label: '2.5 Disponibilidade para acompanhamento e apoio aos estudantes',
      stats: data.teaching.disponibilidade_apoio,
    },
    {
      label: '2.6 Estímulo à participação dos estudantes',
      stats: data.teaching.estimulo_participacao,
    },
    {
      label: '2.7 Apreciação global do docente na unidade curricular',
      stats: data.teaching.apreciacao_global_docente,
    },
  ];

  // Preparar dados para a tabela de Avaliação da Organização
  const organizationItems = [
    {
      label: '3.1 Apoio da equipa executiva',
      stats: data.organization.apoio_equipa_executiva,
    },
    {
      label: '3.2 Organização e condições do curso',
      stats: data.organization.organizacao_condicoes_curso,
    },
    {
      label: '3.3 Instalações e Equipamentos - [preencher apenas no caso de ter havido uma ou mais aulas presenciais]',
      stats: data.organization.instalacoes_equipamentos,
    },
  ];

  return (
    <div className="space-y-6 print:space-y-0" id="report-content">
      {/* Página 1: Header + 2 primeiras secções */}
      <div className="page-1">
        {/* Header com informação do módulo */}
        <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">
            Avaliação do curso pelos estudantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-900">
            <div className="grid grid-cols-2 gap-x-4">
              <p className="font-semibold text-gray-900">Unidade Curricular em Avaliação:</p>
              <p className="text-gray-900">
                {data.module === 'ALL'
                  ? 'Todos os Módulos'
                  : `${data.module} - ${getModuleName(data.module)}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <p className="font-semibold text-gray-900">Número de estudantes inscritos (inquiridos):</p>
              <p className="text-gray-900">{data.totalStudents}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <p className="font-semibold text-gray-900">Número de respostas válidas:</p>
              <p className="text-gray-900">{data.totalResponses}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <p className="font-semibold text-gray-900">Taxa de resposta:</p>
              <p className="text-gray-900">{data.responseRate}%</p>
            </div>

          </div>
        </CardContent>
      </Card>

        {/* Avaliação da Disciplina */}
        <Card className="print:break-inside-avoid mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900">1. Avaliação da Disciplina</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportTable
              title=""
              items={disciplineItems}
            />
          </CardContent>
        </Card>
      </div>

      {/* Página 2: Secções 2 e 3 + Gráficos */}
      <div className="page-break page-2">
        {/* Avaliação Docente */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="text-gray-900">2. Avaliação Docente</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportTable
              title=""
              items={teachingItems}
            />
          </CardContent>
        </Card>

        {/* Avaliação da Organização */}
        <Card className="print:break-inside-avoid mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900">3. Avaliação da organização</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportTable
              title=""
              items={organizationItems}
            />
          </CardContent>
        </Card>
      </div>

      {/* Página 3: Todos os gráficos + Comentários */}
      <div className="page-break page-3">
        {/* Gráficos de Avaliação */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="text-gray-900">4. Visualização de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ReportCharts
                title="Avaliação da Disciplina"
                items={disciplineItems}
              />
              <ReportCharts
                title="Avaliação Docente"
                items={teachingItems}
              />
              <ReportCharts
                title="Avaliação da Organização"
                items={organizationItems}
              />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Página 4: Comentários */}
      <div className="page-break page-4">
        {/* Comentários e sugestões */}
        <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">5. Comentários e Sugestões</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-gray-900">#N/A</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3 border-b border-gray-200 pb-3 last:border-b-0">
                  <p className="text-sm text-gray-900 flex-1">{comment.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComment(index)}
                    disabled={deletingIndex === index}
                    className="print:hidden text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 disabled:opacity-50"
                    title="Remover comentário permanentemente"
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
