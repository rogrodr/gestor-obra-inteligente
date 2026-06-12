import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarObraDto } from './dto/criar-obra.dto';
import { AtualizarObraDto } from './dto/atualizar-obra.dto';

@Injectable()
export class ObrasService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarObraDto, usuarioId: string) {
    return this.prisma.obra.create({
      data: {
        ...dto,
        usuarioId,
      },
      include: {
        cliente: true,
      },
    });
  }

  async buscarTodas(usuarioId: string) {
    return this.prisma.obra.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true },
        },
        _count: {
          select: { lancamentos: true, servicosAvulsos: true },
        },
      },
    });
  }

  async buscarPorId(id: string, usuarioId: string) {
    const obra = await this.prisma.obra.findFirst({
      where: { id, usuarioId },
      include: {
        cliente: true,
        lancamentos: {
          orderBy: { createdAt: 'desc' },
        },
        servicosAvulsos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!obra) throw new NotFoundException('Obra não encontrada');
    return obra;
  }

  async atualizar(id: string, dto: AtualizarObraDto, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    return this.prisma.obra.update({
      where: { id },
      data: dto,
      include: { cliente: true },
    });
  }

  async remover(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    await this.prisma.obra.delete({ where: { id } });
    return { mensagem: 'Obra removida com sucesso' };
  }

  async resumoFinanceiro(id: string, usuarioId: string) {
    const obra = await this.buscarPorId(id, usuarioId);

    const entradas = obra.lancamentos
      .filter((l) => l.tipo === 'ENTRADA')
      .reduce((acc, l) => acc + l.valor, 0);

    const saidas = obra.lancamentos
      .filter((l) => l.tipo === 'SAIDA')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalServicosAvulsos = obra.servicosAvulsos
      .reduce((acc, m) => acc + m.total, 0);

    return {
      obra: { id: obra.id, nome: obra.nome, status: obra.status, etapaAtual: obra.etapaAtual },
      financeiro: {
        totalEntradas: entradas,
        totalSaidas: saidas + totalServicosAvulsos,
        totalServicosAvulsos, // Renomeado no retorno do JSON também
        saldo: entradas - saidas - totalServicosAvulsos,
      },
    };
  }

  async dashboard(usuarioId: string) {
    const obras = await this.prisma.obra.findMany({
      where: { usuarioId },
      include: {
        lancamentos: true,
        servicosAvulsos: true,
        presencas: true,
        cliente: { select: { id: true, nome: true } },
      },
    });

    const obrasAtivas = obras.filter((o) => o.status === 'EM_ANDAMENTO').length;
    const obrasConcluidas = obras.filter((o) => o.status === 'CONCLUIDA').length;

    // Saldo total de todas as obras
    let totalEntradas = 0;
    let totalSaidas = 0;

    obras.forEach((obra) => {
      obra.lancamentos.forEach((l) => {
        if (l.tipo === 'ENTRADA') totalEntradas += l.valor;
        if (l.tipo === 'SAIDA') totalSaidas += l.valor;
      });
      obra.servicosAvulsos.forEach((m) => (totalSaidas += m.total));
      obra.presencas.forEach((p) => (totalSaidas += p.total));
    });

    // Últimos 5 lançamentos de todas as obras
    const todosLancamentos = obras
      .flatMap((o) =>
        o.lancamentos.map((l) => ({
          ...l,
          obraId: o.id,
          obraNome: o.nome,
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Obras recentes
    const obrasRecentes = obras
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        nome: o.nome,
        status: o.status,
        etapaAtual: o.etapaAtual,
        cliente: o.cliente,
      }));

    return {
      resumo: {
        obrasAtivas,
        obrasConcluidas,
        totalObras: obras.length,
        totalEntradas,
        totalSaidas,
        saldoGeral: totalEntradas - totalSaidas,
      },
      ultimosLancamentos: todosLancamentos,
      obrasRecentes,
    };
  } 

  async fluxoCaixaMensal(usuarioId: string, ano: number) {
    const inicio = new Date(ano, 0, 1);
    const fim = new Date(ano, 11, 31);

    const lancamentos = await this.prisma.lancamento.findMany({
      where: {
        obra: { usuarioId },
        createdAt: { gte: inicio, lte: fim },
      },
    });

    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      nomeMes: new Date(ano, i, 1).toLocaleString('pt-BR', { month: 'long' }),
      entradas: 0,
      saidas: 0,
      saldo: 0,
    }));

    lancamentos.forEach((l) => {
      const mes = new Date(l.createdAt).getMonth();
      if (l.tipo === 'ENTRADA') meses[mes].entradas += l.valor;
      if (l.tipo === 'SAIDA') meses[mes].saidas += l.valor;
    });

    meses.forEach((m) => (m.saldo = m.entradas - m.saidas));

    return { ano, meses };
  }
}