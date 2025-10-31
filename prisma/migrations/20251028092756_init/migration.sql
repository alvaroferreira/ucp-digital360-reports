-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SyncStatusEnum" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentResponse" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "clarezaObjetivos" INTEGER,
    "articulacaoModulos" INTEGER,
    "utilizacaoPlataformas" INTEGER,
    "contributoAquisicao" INTEGER,
    "apreciacaoGlobalDisciplina" INTEGER,
    "estruturacaoAulas" INTEGER,
    "exposicaoConteudos" INTEGER,
    "dominioConteudos" INTEGER,
    "cumprimentoHorario" INTEGER,
    "disponibilidadeApoio" INTEGER,
    "estimuloParticipacao" INTEGER,
    "apreciacaoGlobalDocente" INTEGER,
    "apoioEquipaExecutiva" INTEGER,
    "organizacaoCondicoesCurso" INTEGER,
    "instalacoesEquipamentos" INTEGER,
    "comentarios" TEXT,
    "comentariosDeleted" BOOLEAN NOT NULL DEFAULT false,
    "gsheetsRowIndex" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT,
    "recordId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncStatus" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "SyncStatusEnum" NOT NULL,
    "rowsProcessed" INTEGER NOT NULL DEFAULT 0,
    "rowsAdded" INTEGER NOT NULL DEFAULT 0,
    "rowsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "triggeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "StudentResponse_module_edition_idx" ON "StudentResponse"("module", "edition");

-- CreateIndex
CREATE INDEX "StudentResponse_email_idx" ON "StudentResponse"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentResponse_email_module_edition_key" ON "StudentResponse"("email", "module", "edition");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "SyncStatus_startedAt_idx" ON "SyncStatus"("startedAt");

-- CreateIndex
CREATE INDEX "SyncStatus_status_idx" ON "SyncStatus"("status");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncStatus" ADD CONSTRAINT "SyncStatus_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
