/*
  Warnings:

  - The `status` column on the `Equipamento` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Equipamento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusEquipamento" AS ENUM ('DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'BAIXADO');

-- CreateEnum
CREATE TYPE "StatusMaterial" AS ENUM ('PENDENTE', 'COMPRADO');

-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusEquipamento" NOT NULL DEFAULT 'DISPONIVEL';

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusMaterial" NOT NULL DEFAULT 'PENDENTE',
    "obraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
