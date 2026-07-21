-- CreateEnum
CREATE TYPE "TipoContaReceber" AS ENUM ('PARCELA', 'POR_ETAPA', 'SINAL', 'MEDICAO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusContaReceber" AS ENUM ('PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataRecebimento" TIMESTAMP(3),
    "status" "StatusContaReceber" NOT NULL DEFAULT 'PENDENTE',
    "tipo" "TipoContaReceber" NOT NULL DEFAULT 'PARCELA',
    "etapaVinculada" "EtapaObra",
    "observacao" TEXT,
    "clienteId" TEXT,
    "obraId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
