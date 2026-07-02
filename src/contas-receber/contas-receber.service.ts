import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarContaReceberDto } from './dto/criar-conta-receber.dto';
import { AtualizarContaReceberDto } from './dto/atualizar-conta-receber.dto';

@Injectable()
export class ContasReceberService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarContaReceberDto, usuarioId: string) {
    return this.prisma.contaReceber.create({
      data: {
        ...dto,
        dataVencimento: new Date(dto.dataVencimento),
        usuarioId,
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        obra: { select: { id: true, nome: true } },
      },
    });
  }

  async buscarTodos(usuarioId: string) {
    // Atualiza automaticamente contas vencidas antes de retornar
    await this.atualizarVencidas(usuarioId);

    return this.prisma.contaReceber.findMany({
      where: { usuarioId },
      orderBy: { dataVencimento: 'asc' },
      include: {
        cliente: { select: { id: true, nome: true } },
        obra: { select: { id: true, nome: true } },
      },
    });
  }

  async buscarPorObra(obraId: string, usuarioId: string) {
    await this.atualizarVencidas(usuarioId);

    const contas = await this.prisma.contaReceber.findMany({
      where: { obraId, usuarioId },
      orderBy: { dataVencimento: 'asc' },
      include: {
        cliente: { select: { id: true, nome: true } },
      },
    });

    const totalPendente = contas
      .filter((c) => c.status === 'PENDENTE' || c.status === 'VENCIDO')
      .reduce((acc, c) => acc + c.valor, 0);

    const totalRecebido = contas
      .filter((c) => c.status === 'RECEBIDO')
      .reduce((acc, c) => acc + c.valor, 0);

    return { contas, totalPendente, totalRecebido };
  }

  async buscarPorId(id: string, usuarioId: string) {
    const conta = await this.prisma.contaReceber.findFirst({
      where: { id, usuarioId },
      include: {
        cliente: true,
        obra: { select: { id: true, nome: true } },
      },
    });

    if (!conta) throw new NotFoundException('Conta a receber não encontrada');
    return conta;
  }

  async atualizar(id: string, dto: AtualizarContaReceberDto, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);

    return this.prisma.contaReceber.update({
      where: { id },
      data: {
        ...dto,
        dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        obra: { select: { id: true, nome: true } },
      },
    });
  }

  // Marca como recebido e cria lançamento de ENTRADA automaticamente
  async marcarRecebido(id: string, usuarioId: string) {
    const conta = await this.buscarPorId(id, usuarioId);

    if (conta.status === 'RECEBIDO') {
      throw new NotFoundException('Conta já foi marcada como recebida');
    }

    const dataRecebimento = new Date();

    // Atualiza o status da conta
    const contaAtualizada = await this.prisma.contaReceber.update({
      where: { id },
      data: {
        status: 'RECEBIDO',
        dataRecebimento,
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        obra: { select: { id: true, nome: true } },
      },
    });

    // Cria lançamento de ENTRADA automaticamente
    await this.prisma.lancamento.create({
      data: {
        descricao: `Recebimento: ${conta.descricao}`,
        valor: conta.valor,
        tipo: 'ENTRADA',
        categoria: 'Recebimento',
        origem: 'MANUAL',
        obraId: conta.obraId,
      },
    });

    return {
      conta: contaAtualizada,
      mensagem: `✅ R$ ${conta.valor.toFixed(2)} recebido e lançamento de entrada criado automaticamente`,
    };
  }

  async remover(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    await this.prisma.contaReceber.delete({ where: { id } });
    return { mensagem: 'Conta a receber removida com sucesso' };
  }

  // Atualiza automaticamente contas PENDENTES vencidas para VENCIDO
  private async atualizarVencidas(usuarioId: string) {
    await this.prisma.contaReceber.updateMany({
      where: {
        usuarioId,
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() },
      },
      data: { status: 'VENCIDO' },
    });
  }
}