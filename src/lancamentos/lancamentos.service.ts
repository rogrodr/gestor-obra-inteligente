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

  // Busca lançamentos por obra com filtros opcionais de categoria e tipo
  async buscarPorObra(
    obraId: string,
    categoria?: string,
    tipo?: 'ENTRADA' | 'SAIDA',
  ) {
    const lancamentos = await this.prisma.lancamento.findMany({
      where: {
        obraId,
        ...(categoria ? { categoria } : {}),
        ...(tipo ? { tipo } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEntradas = lancamentos
      .filter((l) => l.tipo === 'ENTRADA')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalSaidas = lancamentos
      .filter((l) => l.tipo === 'SAIDA')
      .reduce((acc, l) => acc + l.valor, 0);

    return {
      lancamentos,
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      total: lancamentos.length,
    };
  }

  // Busca lançamentos agrupados por categoria para uma obra
  async resumoPorCategoria(obraId: string) {
    const lancamentos = await this.prisma.lancamento.findMany({
      where: { obraId, tipo: 'SAIDA' },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupa por categoria e soma os valores
    const categorias = lancamentos.reduce(
      (acc, l) => {
        const cat = l.categoria ?? 'Outros';
        if (!acc[cat]) acc[cat] = { categoria: cat, total: 0, quantidade: 0 };
        acc[cat].total += l.valor;
        acc[cat].quantidade += 1;
        return acc;
      },
      {} as Record<string, { categoria: string; total: number; quantidade: number }>,
    );

    return {
      obraId,
      categorias: Object.values(categorias).sort((a, b) => b.total - a.total),
      totalGeral: lancamentos.reduce((acc, l) => acc + l.valor, 0),
    };
  }

  async remover(id: string) {
    const lancamento = await this.prisma.lancamento.findUnique({ where: { id } });
    if (!lancamento) throw new NotFoundException('Lançamento não encontrado');

    await this.prisma.lancamento.delete({ where: { id } });
    return { mensagem: 'Lançamento removido com sucesso' };
  }

  async processarVoz(texto: string, obraId: string) {
    return { texto, obraId };
  }
}