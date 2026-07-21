-- DropForeignKey
ALTER TABLE "Orcamento" DROP CONSTRAINT "Orcamento_clienteId_fkey";

-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "nomeClienteTemporario" TEXT,
ADD COLUMN     "telefoneClienteTemporario" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
