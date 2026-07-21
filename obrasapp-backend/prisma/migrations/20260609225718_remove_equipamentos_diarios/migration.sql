/*
  Warnings:

  - You are about to drop the `DiarioObra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Equipamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Foto` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "StatusMaterial" ADD VALUE 'CANCELADO';

-- DropForeignKey
ALTER TABLE "DiarioObra" DROP CONSTRAINT "DiarioObra_obraId_fkey";

-- DropForeignKey
ALTER TABLE "Equipamento" DROP CONSTRAINT "Equipamento_obraId_fkey";

-- DropForeignKey
ALTER TABLE "Equipamento" DROP CONSTRAINT "Equipamento_trabalhadorId_fkey";

-- DropForeignKey
ALTER TABLE "Foto" DROP CONSTRAINT "Foto_diarioObraId_fkey";

-- DropTable
DROP TABLE "DiarioObra";

-- DropTable
DROP TABLE "Equipamento";

-- DropTable
DROP TABLE "Foto";

-- DropEnum
DROP TYPE "StatusEquipamento";
