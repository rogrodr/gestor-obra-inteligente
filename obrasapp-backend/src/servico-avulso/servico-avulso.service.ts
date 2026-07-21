import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarServicoAvulsoDto } from './dto/criar-servico-avulso.dto';

@Injectable()
export class ServicoAvulsoService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarServicoAvulsoDto) {
    const total = dto.diasTrabalhados * dto.valorPorDia;

    return this.prisma.servicoAvulso.create({
      data: {
        ...dto,
        total,
      },
      include: { obra: { select: { id: true, nome: true } } },
    });
  }

  async buscarPorObra(obraId: string) {
    return this.prisma.servicoAvulso.findMany({
      where: { obraId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remover(id: string) {
    const servicoAvulso = await this.prisma.servicoAvulso.findUnique({ where: { id } });
    if (!servicoAvulso) throw new NotFoundException('Registro não encontrado');

    await this.prisma.servicoAvulso.delete({ where: { id } });
    return { mensagem: 'Registro removido com sucesso' };
  }
}