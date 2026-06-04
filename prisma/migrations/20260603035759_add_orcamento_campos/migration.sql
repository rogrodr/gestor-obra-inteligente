-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "condicoesPagamento" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "validadeEmDias" INTEGER NOT NULL DEFAULT 30;
