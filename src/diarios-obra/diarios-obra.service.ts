import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarDiarioObraDto } from './dto/criar-diario-obra.dto';
import { AtualizarDiarioObraDto } from './dto/atualizar-diario-obra.dto';

@Injectable()
export class DiariosObraService {
  constructor(private prisma: PrismaService) {}

  async criar(criarDto: CriarDiarioObraDto) {
    return this.prisma.diarioObra.create({
      data: {
        clima: criarDto.clima,
        atividades: criarDto.atividades,
        data: criarDto.data ? new Date(criarDto.data) : undefined,
        obraId: criarDto.obraId,
        fotos: {
          create: criarDto.fotos.map((url) => ({ url })),
        },
      },
      include: { fotos: true },
    });
  }

  async buscarTodosPorObra(obraId: string) {
    return this.prisma.diarioObra.findMany({
      where: { obraId },
      include: { fotos: true },
      orderBy: { data: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    const diario = await this.prisma.diarioObra.findUnique({
      where: { id },
      include: { fotos: true },
    });
    if (!diario) throw new NotFoundException('Diário de obra não encontrado');
    return diario;
  }

  async atualizar(id: string, atualizarDto: AtualizarDiarioObraDto) {
    await this.buscarPorId(id);
    return this.prisma.diarioObra.update({
      where: { id },
      data: {
        clima: atualizarDto.clima,
        atividades: atualizarDto.atividades,
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    return this.prisma.diarioObra.delete({
      where: { id },
    });
  }
}