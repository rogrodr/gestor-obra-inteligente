import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarMaoDeObraDto } from './dto/criar-mao-de-obra.dto';

@Injectable()
export class MaoDeObraService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarMaoDeObraDto) {
    const total = dto.diasTrabalhados * dto.valorPorDia;

    return this.prisma.maoDeObra.create({
      data: {
        ...dto,
        total,
      },
      include: { obra: { select: { id: true, nome: true } } },
    });
  }

  async buscarPorObra(obraId: string) {
    return this.prisma.maoDeObra.findMany({
      where: { obraId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remover(id: string) {
    const maoDeObra = await this.prisma.maoDeObra.findUnique({ where: { id } });
    if (!maoDeObra) throw new NotFoundException('Registro não encontrado');

    await this.prisma.maoDeObra.delete({ where: { id } });
    return { mensagem: 'Registro removido com sucesso' };
  }
}