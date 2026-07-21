import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTrabalhadorDto } from './dto/criar-trabalhador.dto';
import { AtualizarTrabalhadorDto } from './dto/atualizar-trabalhador.dto';
import { CriarPresencaDto } from './dto/criar-presenca.dto';

@Injectable()
export class TrabalhadoresService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarTrabalhadorDto) {
    return this.prisma.trabalhador.create({ data: dto });
  }

  async buscarTodos() {
    return this.prisma.trabalhador.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      include: {
        _count: { select: { presencas: true } },
      },
    });
  }

  async buscarPorId(id: string) {
    const trabalhador = await this.prisma.trabalhador.findUnique({
      where: { id },
      include: {
        presencas: {
          orderBy: { data: 'desc' },
          include: {
            obra: { select: { id: true, nome: true } },
          },
        },
        adiantamentos: {
          orderBy: { data: 'desc' },
          include: {
            obra: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!trabalhador) throw new NotFoundException('Trabalhador não encontrado');
    return trabalhador;
  }

  async atualizar(id: string, dto: AtualizarTrabalhadorDto) {
    await this.buscarPorId(id);

    return this.prisma.trabalhador.update({
      where: { id },
      data: dto,
    });
  }

  async desativar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.trabalhador.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async registrarPresenca(dto: CriarPresencaDto) {
    const total = dto.diasTrabalhados * dto.valorDia;

    return this.prisma.presenca.create({
      data: { ...dto, total },
      include: {
        trabalhador: { select: { id: true, nome: true, funcao: true } },
        obra: { select: { id: true, nome: true } },
      },
    });
  }

  async buscarPresencasPorObra(obraId: string) {
    const presencas = await this.prisma.presenca.findMany({
      where: { obraId },
      orderBy: { data: 'desc' },
      include: {
        trabalhador: { select: { id: true, nome: true, funcao: true } },
      },
    });

    const totalGasto = presencas.reduce((acc, p) => acc + p.total, 0);

    return { presencas, totalGasto };
  }

  async buscarPresencasPorTrabalhador(trabalhadorId: string) {
    const presencas = await this.prisma.presenca.findMany({
      where: { trabalhadorId },
      orderBy: { data: 'desc' },
      include: {
        obra: { select: { id: true, nome: true } },
      },
    });

    const totalReceber = presencas.reduce((acc, p) => acc + p.total, 0);

    return { presencas, totalReceber };
  }

  // ─── EXTRATO CONSOLIDADO DO TRABALHADOR ──────────────────────────────────
  // Retorna histórico completo: presenças + adiantamentos + saldo líquido a pagar
  async extrato(trabalhadorId: string, obraId?: string) {
    const trabalhador = await this.prisma.trabalhador.findUnique({
      where: { id: trabalhadorId },
    });

    if (!trabalhador) throw new NotFoundException('Trabalhador não encontrado');

    // Filtro por obra se informado
    const filtroObra = obraId ? { obraId } : {};

    const presencas = await this.prisma.presenca.findMany({
      where: { trabalhadorId, ...filtroObra },
      orderBy: { data: 'desc' },
      include: {
        obra: { select: { id: true, nome: true } },
      },
    });

    const adiantamentos = await this.prisma.adiantamento.findMany({
      where: { trabalhadorId, ...filtroObra },
      orderBy: { data: 'desc' },
      include: {
        obra: { select: { id: true, nome: true } },
      },
    });

    const totalBruto = presencas.reduce((acc, p) => acc + p.total, 0);
    const totalAdiantamentos = adiantamentos.reduce((acc, a) => acc + a.valor, 0);
    const totalDiasTrabalhados = presencas.reduce((acc, p) => acc + p.diasTrabalhados, 0);
    const saldoLiquido = totalBruto - totalAdiantamentos;

    // Monta histórico unificado ordenado por data para facilitar visualização
    const historico = [
      ...presencas.map((p) => ({
        tipo: 'PRESENCA' as const,
        data: p.data,
        descricao: `${p.diasTrabalhados} dia(s) trabalhado(s)`,
        valor: p.total,
        obra: p.obra,
        pago: p.pago,
      })),
      ...adiantamentos.map((a) => ({
        tipo: 'ADIANTAMENTO' as const,
        data: a.data,
        descricao: a.descricao ?? 'Vale / Adiantamento',
        valor: -a.valor, // negativo pois é desconto no saldo
        obra: a.obra,
        pago: true,
      })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return {
      trabalhador: {
        id: trabalhador.id,
        nome: trabalhador.nome,
        funcao: trabalhador.funcao,
        tipoContrato: trabalhador.tipoContrato,
        valorDia: trabalhador.valorDia,
      },
      resumo: {
        totalDiasTrabalhados,
        totalBruto,
        totalAdiantamentos,
        saldoLiquido,
      },
      historico,
    };
  }

  async removerPresenca(id: string) {
    const presenca = await this.prisma.presenca.findUnique({ where: { id } });
    if (!presenca) throw new NotFoundException('Presença não encontrada');

    await this.prisma.presenca.delete({ where: { id } });
    return { mensagem: 'Presença removida com sucesso' };
  }
}