import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { syncFromGoogleSheets, getSyncHistory, getLastSyncStatus } from '@/lib/sync-service';

/**
 * POST /api/sync
 * Triggers manual sync from Google Sheets to PostgreSQL
 * ADMIN only
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem sincronizar.' },
        { status: 403 }
      );
    }

    console.log(`🔄 Sync triggered by ${session.user.email}`);

    // Perform sync
    const result = await syncFromGoogleSheets(
      session.accessToken,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Sync falhou',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      stats: {
        rowsProcessed: result.rowsProcessed,
        rowsAdded: result.rowsAdded,
        rowsUpdated: result.rowsUpdated,
      },
    });
  } catch (error) {
    console.error('Error during sync:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * Get sync history and status
 * ADMIN only
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const lastSync = await getLastSyncStatus();
    const history = await getSyncHistory(limit);

    return NextResponse.json({
      lastSync,
      history,
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Erro ao obter histórico de sincronização' },
      { status: 500 }
    );
  }
}
