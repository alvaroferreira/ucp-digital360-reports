import { prisma } from './prisma';
import { readBaseDados } from './google-sheets';
import { parseSheetData } from './data-processor';
import { StudentResponse } from '@/types';

export interface SyncResult {
  success: boolean;
  rowsProcessed: number;
  rowsAdded: number;
  rowsUpdated: number;
  errors: string[];
}

/**
 * Incrementally syncs data from Google Sheets to PostgreSQL
 * Preserves curated data (deleted comments) during sync
 */
export async function syncFromGoogleSheets(
  accessToken: string,
  userId: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    rowsProcessed: 0,
    rowsAdded: 0,
    rowsUpdated: 0,
    errors: [],
  };

  // Create sync status record
  const syncStatus = await prisma.syncStatus.create({
    data: {
      startedAt: new Date(),
      status: 'RUNNING',
      triggeredById: userId,
    },
  });

  try {
    console.log('🔄 Starting sync from Google Sheets...');

    // Read all data from Google Sheets
    const rawData = await readBaseDados(accessToken);
    const sheetData: StudentResponse[] = parseSheetData(rawData);

    console.log(`📊 Found ${sheetData.length} rows in Google Sheets`);

    for (const row of sheetData) {
      try {
        const uniqueKey = {
          email: row.email,
          module: row.module,
          edition: row.edition,
        };

        // Check if record exists
        const existing = await prisma.studentResponse.findUnique({
          where: {
            email_module_edition: uniqueKey,
          },
          select: {
            id: true,
            comentariosDeleted: true,
            comentarios: true,
          },
        });

        if (existing) {
          // Record exists - update with incremental logic
          const updateData: any = {
            timestamp: new Date(row.timestamp),
            clarezaObjetivos: row.clareza_objetivos,
            articulacaoModulos: row.articulacao_modulos,
            utilizacaoPlataformas: row.utilizacao_plataformas,
            contributoAquisicao: row.contributo_aquisicao,
            apreciacaoGlobalDisciplina: row.apreciacao_global_disciplina,
            estruturacaoAulas: row.estruturacao_aulas,
            exposicaoConteudos: row.exposicao_conteudos,
            dominioConteudos: row.dominio_conteudos,
            cumprimentoHorario: row.cumprimento_horario,
            disponibilidadeApoio: row.disponibilidade_apoio,
            estimuloParticipacao: row.estimulo_participacao,
            apreciacaoGlobalDocente: row.apreciacao_global_docente,
            apoioEquipaExecutiva: row.apoio_equipa_executiva,
            organizacaoCondicoesCurso: row.organizacao_condicoes_curso,
            instalacoesEquipamentos: row.instalacoes_equipamentos,
            lastSyncedAt: new Date(),
          };

          // 🔑 KEY LOGIC: Only update comment if it hasn't been deleted
          if (!existing.comentariosDeleted) {
            updateData.comentarios = row.comentarios || null;
          } else {
            console.log(`⏭️  Skipping comment update for ${row.email} (deleted by curator)`);
          }

          await prisma.studentResponse.update({
            where: {
              email_module_edition: uniqueKey,
            },
            data: updateData,
          });

          result.rowsUpdated++;
        } else {
          // New record - insert
          await prisma.studentResponse.create({
            data: {
              email: row.email,
              module: row.module,
              edition: row.edition,
              timestamp: new Date(row.timestamp),
              clarezaObjetivos: row.clareza_objetivos,
              articulacaoModulos: row.articulacao_modulos,
              utilizacaoPlataformas: row.utilizacao_plataformas,
              contributoAquisicao: row.contributo_aquisicao,
              apreciacaoGlobalDisciplina: row.apreciacao_global_disciplina,
              estruturacaoAulas: row.estruturacao_aulas,
              exposicaoConteudos: row.exposicao_conteudos,
              dominioConteudos: row.dominio_conteudos,
              cumprimentoHorario: row.cumprimento_horario,
              disponibilidadeApoio: row.disponibilidade_apoio,
              estimuloParticipacao: row.estimulo_participacao,
              apreciacaoGlobalDocente: row.apreciacao_global_docente,
              apoioEquipaExecutiva: row.apoio_equipa_executiva,
              organizacaoCondicoesCurso: row.organizacao_condicoes_curso,
              instalacoesEquipamentos: row.instalacoes_equipamentos,
              comentarios: row.comentarios || null,
              comentariosDeleted: false,
              lastSyncedAt: new Date(),
            },
          });

          result.rowsAdded++;
        }

        result.rowsProcessed++;
      } catch (rowError) {
        console.error(`❌ Error processing row for ${row.email}:`, rowError);
        result.errors.push(`Error for ${row.email}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
      }
    }

    // Update sync status to SUCCESS
    await prisma.syncStatus.update({
      where: { id: syncStatus.id },
      data: {
        completedAt: new Date(),
        status: 'SUCCESS',
        rowsProcessed: result.rowsProcessed,
        rowsAdded: result.rowsAdded,
        rowsUpdated: result.rowsUpdated,
      },
    });

    result.success = true;
    console.log('✅ Sync completed successfully!');
    console.log(`📊 Stats: Processed=${result.rowsProcessed}, Added=${result.rowsAdded}, Updated=${result.rowsUpdated}`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');

    // Update sync status to FAILED
    await prisma.syncStatus.update({
      where: { id: syncStatus.id },
      data: {
        completedAt: new Date(),
        status: 'FAILED',
        rowsProcessed: result.rowsProcessed,
        rowsAdded: result.rowsAdded,
        rowsUpdated: result.rowsUpdated,
        errorMessage: result.errors.join('; '),
      },
    });
  }

  return result;
}

/**
 * Get recent sync history
 */
export async function getSyncHistory(limit: number = 10) {
  return await prisma.syncStatus.findMany({
    take: limit,
    orderBy: {
      startedAt: 'desc',
    },
    include: {
      triggeredBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get the most recent sync status
 */
export async function getLastSyncStatus() {
  return await prisma.syncStatus.findFirst({
    orderBy: {
      startedAt: 'desc',
    },
    include: {
      triggeredBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}
