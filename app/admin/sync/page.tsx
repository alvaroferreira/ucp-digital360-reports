'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SyncStatus {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  rowsProcessed: number;
  rowsAdded: number;
  rowsUpdated: number;
  errorMessage: string | null;
  triggeredBy: {
    email: string;
    name: string | null;
  } | null;
}

interface SyncHistory {
  lastSync: SyncStatus | null;
  history: SyncStatus[];
}

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncHistory();
  }, []);

  const fetchSyncHistory = async () => {
    try {
      const response = await fetch('/api/sync');
      if (!response.ok) {
        throw new Error('Failed to fetch sync history');
      }
      const data = await response.json();
      setSyncHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      // Refresh history after successful sync
      await fetchSyncHistory();

      alert(`Sync completed!\n\nProcessed: ${data.stats.rowsProcessed}\nAdded: ${data.stats.rowsAdded}\nUpdated: ${data.stats.rowsUpdated}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      alert(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRenewToken = () => {
    // Redirect to Google OAuth to renew token (admin only)
    window.location.href = '/api/auth/google-oauth';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'RUNNING':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="text-green-600 font-semibold">Sucesso</span>;
      case 'FAILED':
        return <span className="text-red-600 font-semibold">Falhou</span>;
      case 'RUNNING':
        return <span className="text-blue-600 font-semibold">Em execução</span>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Token Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Google Sheets OAuth Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                O token OAuth permite a sincronização com o Google Sheets.
              </p>
              <p className="text-sm text-gray-700">
                Se encontrar erros de autenticação, renove o token abaixo.
              </p>
            </div>
            <Button onClick={handleRenewToken} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Renovar Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Sincronização de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-red-600">Erro: {error}</div>
          ) : (
            <>
              {syncHistory?.lastSync && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Última sincronização:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(syncHistory.lastSync.status)}
                      {getStatusText(syncHistory.lastSync.status)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div>Data: {format(new Date(syncHistory.lastSync.startedAt), 'dd/MM/yyyy HH:mm:ss')}</div>
                    <div>Linhas processadas: {syncHistory.lastSync.rowsProcessed}</div>
                    <div>Linhas adicionadas: {syncHistory.lastSync.rowsAdded}</div>
                    <div>Linhas atualizadas: {syncHistory.lastSync.rowsUpdated}</div>
                    {syncHistory.lastSync.triggeredBy && (
                      <div>Por: {syncHistory.lastSync.triggeredBy.email}</div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSync}
                disabled={syncing}
                className="w-full"
                size="lg"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A sincronizar...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Sincronizar Agora
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-600">
                Esta operação sincroniza dados do Google Sheets para o PostgreSQL.
                Os comentários eliminados manualmente serão preservados durante a sincronização.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      {syncHistory?.history && syncHistory.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Histórico de Sincronizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-900">Data</th>
                    <th className="text-left py-2 px-3 text-gray-900">Estado</th>
                    <th className="text-right py-2 px-3 text-gray-900">Processadas</th>
                    <th className="text-right py-2 px-3 text-gray-900">Adicionadas</th>
                    <th className="text-right py-2 px-3 text-gray-900">Atualizadas</th>
                    <th className="text-left py-2 px-3 text-gray-900">Utilizador</th>
                  </tr>
                </thead>
                <tbody>
                  {syncHistory.history.map((sync) => (
                    <tr key={sync.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">
                        {format(new Date(sync.startedAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sync.status)}
                          {getStatusText(sync.status)}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">{sync.rowsProcessed}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{sync.rowsAdded}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{sync.rowsUpdated}</td>
                      <td className="py-2 px-3 text-gray-700">
                        {sync.triggeredBy?.email || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
