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
        presencas: {
          orderBy: { data: 'desc' },
          include: {
            trabalhador: { select: { id: true, nome: true, funcao: true } },
          },
        },
        adiantamentos: {
          orderBy: { data: 'desc' },
          include: {
            trabalhador: { select: { id: true, nome: true } },
          },
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
      data: {
        nome: dto.nome,
        endereco: dto.endereco,
        status: dto.status,
        etapaAtual: dto.etapaAtual,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
        clienteId: dto.clienteId,
      },
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
      .reduce((acc, s) => acc + s.total, 0);

    const totalPresencas = obra.presencas
      .reduce((acc, p) => acc + p.total, 0);

    const totalAdiantamentos = obra.adiantamentos
      .reduce((acc, a) => acc + a.valor, 0);

    const totalMaoDeObra = totalServicosAvulsos + totalPresencas + totalAdiantamentos;

    return {
      obra: {
        id: obra.id,
        nome: obra.nome,
        status: obra.status,
        etapaAtual: obra.etapaAtual,
        cliente: obra.cliente,
      },
      financeiro: {
        totalEntradas: entradas,
        totalSaidas: saidas,
        totalServicosAvulsos,
        totalPresencas,
        totalAdiantamentos,
        totalMaoDeObra,
        saldo: entradas - saidas - totalMaoDeObra,
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
        adiantamentos: true,
        cliente: { select: { id: true, nome: true } },
      },
    });

    const obrasAtivas = obras.filter((o) => o.status === 'EM_ANDAMENTO').length;
    const obrasConcluidas = obras.filter((o) => o.status === 'CONCLUIDA').length;

    let totalEntradas = 0;
    let totalSaidas = 0;

    obras.forEach((obra) => {
      // Lançamentos financeiros
      obra.lancamentos.forEach((l) => {
        if (l.tipo === 'ENTRADA') totalEntradas += l.valor;
        if (l.tipo === 'SAIDA') totalSaidas += l.valor;
      });
      // Mão de obra — tudo que sai como custo de equipe
      obra.servicosAvulsos.forEach((s) => (totalSaidas += s.total));
      obra.presencas.forEach((p) => (totalSaidas += p.total));
      obra.adiantamentos.forEach((a) => (totalSaidas += a.valor));
    });

    // Últimos 5 lançamentos financeiros de todas as obras
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

    // Obras mais recentes por atualização
    const obrasRecentes = [...obras]
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
    const fim = new Date(ano, 11, 31, 23, 59, 59);

    // Busca lançamentos financeiros
    const lancamentos = await this.prisma.lancamento.findMany({
      where: {
        obra: { usuarioId },
        createdAt: { gte: inicio, lte: fim },
      },
    });

    // Busca serviços avulsos, presenças e adiantamentos do mesmo período
    const servicosAvulsos = await this.prisma.servicoAvulso.findMany({
      where: {
        obra: { usuarioId },
        createdAt: { gte: inicio, lte: fim },
      },
    });

    const presencas = await this.prisma.presenca.findMany({
      where: {
        obra: { usuarioId },
        data: { gte: inicio, lte: fim },
      },
    });

    const adiantamentos = await this.prisma.adiantamento.findMany({
      where: {
        obra: { usuarioId },
        data: { gte: inicio, lte: fim },
      },
    });

    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      nomeMes: new Date(ano, i, 1).toLocaleString('pt-BR', { month: 'long' }),
      entradas: 0,
      saidas: 0,
      saldo: 0,
    }));

    // Lançamentos
    lancamentos.forEach((l) => {
      const mes = new Date(l.createdAt).getMonth();
      if (l.tipo === 'ENTRADA') meses[mes].entradas += l.valor;
      if (l.tipo === 'SAIDA') meses[mes].saidas += l.valor;
    });

    // Custos de mão de obra entram como saída
    servicosAvulsos.forEach((s) => {
      const mes = new Date(s.createdAt).getMonth();
      meses[mes].saidas += s.total;
    });

    presencas.forEach((p) => {
      const mes = new Date(p.data).getMonth();
      meses[mes].saidas += p.total;
    });

    adiantamentos.forEach((a) => {
      const mes = new Date(a.data).getMonth();
      meses[mes].saidas += a.valor;
    });

    meses.forEach((m) => (m.saldo = m.entradas - m.saidas));

    return { ano, meses };
  }

  // GET /api/obras/:id/pendencias
  // Retorna um resumo consolidado do que precisa ser resolvido na obra
  async pendencias(id: string, usuarioId: string) {
    const obra = await this.prisma.obra.findFirst({
      where: { id, usuarioId },
      include: {
        presencas: {
          where: { pago: false },
          include: {
            trabalhador: { select: { id: true, nome: true } },
          },
        },
        adiantamentos: {
          include: {
            trabalhador: { select: { id: true, nome: true } },
          },
        },
        locacoes: {
          where: { status: 'ATIVO' },
        },
        materiais: {
          where: { status: 'PENDENTE' },
        },
        contasReceber: {
          where: {
            status: { in: ['PENDENTE', 'VENCIDO'] },
          },
          include: {
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!obra) throw new NotFoundException('Obra não encontrada');

    // Calcula saldo devedor por trabalhador
    const saldoPorTrabalhador = new Map<
      string,
      { id: string; nome: string; totalPresencas: number; totalAdiantamentos: number; saldo: number }
    >();

    obra.presencas.forEach((p) => {
      const key = p.trabalhadorId;
      if (!saldoPorTrabalhador.has(key)) {
        saldoPorTrabalhador.set(key, {
          id: p.trabalhador.id,
          nome: p.trabalhador.nome,
          totalPresencas: 0,
          totalAdiantamentos: 0,
          saldo: 0,
        });
      }
      saldoPorTrabalhador.get(key)!.totalPresencas += p.total;
    });

    obra.adiantamentos.forEach((a) => {
      const key = a.trabalhadorId;
      if (!saldoPorTrabalhador.has(key)) {
        saldoPorTrabalhador.set(key, {
          id: a.trabalhador.id,
          nome: a.trabalhador.nome,
          totalPresencas: 0,
          totalAdiantamentos: 0,
          saldo: 0,
        });
      }
      saldoPorTrabalhador.get(key)!.totalAdiantamentos += a.valor;
    });

    const equipeComSaldo = Array.from(saldoPorTrabalhador.values())
      .map((t) => ({ ...t, saldo: t.totalPresencas - t.totalAdiantamentos }))
      .filter((t) => t.saldo > 0)
      .sort((a, b) => b.saldo - a.saldo);

    // Locações vencendo nos próximos 7 dias ou já vencidas
    const hoje = new Date();
    const em7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    const locacoesAlerta = obra.locacoes
      .map((l) => ({
        id: l.id,
        equipamento: l.equipamento,
        dataFimPrevista: l.dataFimPrevista,
        valor: l.valor,
        locador: l.locador,
        diasRestantes: Math.ceil(
          (new Date(l.dataFimPrevista).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
        ),
        vencida: new Date(l.dataFimPrevista) < hoje,
      }))
      .filter((l) => new Date(l.dataFimPrevista) <= em7Dias)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    // Contas a receber pendentes e vencidas
    const contasReceberAlerta = obra.contasReceber.map((c) => ({
      id: c.id,
      descricao: c.descricao,
      valor: c.valor,
      dataVencimento: c.dataVencimento,
      status: c.status,
      tipo: c.tipo,
      cliente: c.cliente,
      diasAtraso:
        c.status === 'VENCIDO'
          ? Math.ceil(
              (hoje.getTime() - new Date(c.dataVencimento).getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0,
    }));

    const totalAReceber = contasReceberAlerta.reduce((acc, c) => acc + c.valor, 0);
    const totalAPagar = equipeComSaldo.reduce((acc, t) => acc + t.saldo, 0);

    return {
      obraId: id,
      resumo: {
        totalAPagar,
        totalAReceber,
        locacoesVencendo: locacoesAlerta.length,
        materiaisPendentes: obra.materiais.length,
        contasVencidas: contasReceberAlerta.filter((c) => c.status === 'VENCIDO').length,
      },
      equipe: equipeComSaldo,
      locacoes: locacoesAlerta,
      materiais: obra.materiais,
      contasReceber: contasReceberAlerta,
    };
  }
}