-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('DIARISTA', 'EMPREITEIRO');

-- AlterTable
ALTER TABLE "Presenca" ADD COLUMN     "descricaoServico" TEXT,
ADD COLUMN     "tipoContrato" "TipoContrato" NOT NULL DEFAULT 'DIARISTA',
ADD COLUMN     "valorEmpreita" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Trabalhador" ADD COLUMN     "tipoContrato" "TipoContrato" NOT NULL DEFAULT 'DIARISTA';
