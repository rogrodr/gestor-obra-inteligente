import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { AtualizarOrcamentoDto } from './dto/atualizar-orcamento.dto';

@Injectable()
export class OrcamentosService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarOrcamentoDto, usuarioId: string) {
    // Precisa ter cliente cadastrado OU pelo menos um nome temporário
    if (!dto.clienteId && !dto.nomeClienteTemporario) {
      throw new BadRequestException(
        'Informe um cliente cadastrado ou pelo menos um nome temporário para o orçamento.',
      );
    }

    const itensComTotal = dto.itens?.map((item) => ({
      ...item,
      total: item.quantidade * item.valorUnitario,
    }));

    const valorEstimado = itensComTotal?.reduce((acc, item) => acc + item.total, 0) ?? 0;

    return this.prisma.orcamento.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        valorEstimado,
        clienteId: dto.clienteId,
        nomeClienteTemporario: dto.clienteId ? undefined : dto.nomeClienteTemporario,
        telefoneClienteTemporario: dto.clienteId ? undefined : dto.telefoneClienteTemporario,
        usuarioId,
        itens: {
          create: itensComTotal,
        },
      },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        itens: true,
      },
    });
  }

  async buscarTodos(usuarioId: string) {
    return this.prisma.orcamento.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: { select: { id: true, nome: true } },
        _count: { select: { itens: true } },
      },
    });
  }

  async buscarPorId(id: string, usuarioId: string) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id, usuarioId },
      include: {
        cliente: true,
        itens: true,
      },
    });

    if (!orcamento) throw new NotFoundException('Orçamento não encontrado');
    return orcamento;
  }

  async buscarRecentes(usuarioId: string) {
    return this.prisma.orcamento.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        cliente: { select: { id: true, nome: true } },
        itens: true,
      },
    });
  }

  async buscarSugestoes(usuarioId: string, titulo: string) {
    return this.prisma.orcamento.findMany({
      where: {
        usuarioId,
        status: 'APROVADO',
        titulo: { contains: titulo, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { itens: true },
    });
  }

  // Vincula um cliente real a um orçamento que foi criado como rascunho
  async vincularCliente(id: string, clienteId: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    return this.prisma.orcamento.update({
      where: { id },
      data: {
        clienteId,
        nomeClienteTemporario: null,
        telefoneClienteTemporario: null,
      },
      include: { cliente: true, itens: true },
    });
  }

  async atualizar(id: string, dto: AtualizarOrcamentoDto, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    const { itens, ...resto } = dto;

    if (itens && itens.length > 0) {
      await this.prisma.itemOrcamento.deleteMany({ where: { orcamentoId: id } });

      const itensComTotal = itens.map((item) => ({
        ...item,
        total: item.quantidade * item.valorUnitario,
        orcamentoId: id,
      }));

      const valorEstimado = itensComTotal.reduce((acc, item) => acc + item.total, 0);

      await this.prisma.itemOrcamento.createMany({ data: itensComTotal });
      return this.prisma.orcamento.update({
        where: { id },
        data: { ...resto, valorEstimado },
        include: { cliente: true, itens: true },
      });
    }

    return this.prisma.orcamento.update({
      where: { id },
      data: resto,
      include: { cliente: true, itens: true },
    });
  }

  async remover(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    await this.prisma.itemOrcamento.deleteMany({ where: { orcamentoId: id } });
    await this.prisma.orcamento.delete({ where: { id } });

    return { mensagem: 'Orçamento removido com sucesso' };
  }
}