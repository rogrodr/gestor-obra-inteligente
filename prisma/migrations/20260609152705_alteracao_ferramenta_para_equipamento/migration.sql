-- CreateTable
CREATE TABLE "Adiantamento" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "trabalhadorId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "Adiantamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locacao" (
    "id" TEXT NOT NULL,
    "equipamento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFimPrevista" TIMESTAMP(3) NOT NULL,
    "dataDevolucao" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "locador" TEXT,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "Locacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiarioObra" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clima" TEXT NOT NULL,
    "atividades" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "DiarioObra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "diarioObraId" TEXT NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trabalhadorId" TEXT,
    "obraId" TEXT,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Adiantamento" ADD CONSTRAINT "Adiantamento_trabalhadorId_fkey" FOREIGN KEY ("trabalhadorId") REFERENCES "Trabalhador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adiantamento" ADD CONSTRAINT "Adiantamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiarioObra" ADD CONSTRAINT "DiarioObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_diarioObraId_fkey" FOREIGN KEY ("diarioObraId") REFERENCES "DiarioObra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_trabalhadorId_fkey" FOREIGN KEY ("trabalhadorId") REFERENCES "Trabalhador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
