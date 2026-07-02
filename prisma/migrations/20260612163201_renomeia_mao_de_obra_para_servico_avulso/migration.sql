/*
  Warnings:

  - You are about to drop the `MaoDeObra` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaoDeObra" DROP CONSTRAINT "MaoDeObra_obraId_fkey";

-- DropTable
DROP TABLE "MaoDeObra";

-- CreateTable
CREATE TABLE "ServicoAvulso" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "diasTrabalhados" INTEGER NOT NULL,
    "valorPorDia" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "obraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicoAvulso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServicoAvulso" ADD CONSTRAINT "ServicoAvulso_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
