import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarLancamentoDto } from './dto/criar-lancamento.dto';

@Injectable()
export class LancamentosService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarLancamentoDto) {
    return this.prisma.lancamento.create({
      data: dto,
      include: { obra: { select: { id: true, nome: true } } },
    });
  }

  async buscarPorObra(obraId: string) {
    return this.prisma.lancamento.findMany({
      where: { obraId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remover(id: string) {
    const lancamento = await this.prisma.lancamento.findUnique({ where: { id } });
    if (!lancamento) throw new NotFoundException('Lançamento não encontrado');

    await this.prisma.lancamento.delete({ where: { id } });
    return { mensagem: 'Lançamento removido com sucesso' };
  }

  async processarVoz(texto: string, obraId: string) {
    // Esse método será chamado pelo módulo de IA
    // Por enquanto retorna o texto para ser processado
    return { texto, obraId };
  }
}