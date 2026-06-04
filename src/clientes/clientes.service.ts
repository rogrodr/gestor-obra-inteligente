import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarClienteDto) {
    const cliente = await this.prisma.cliente.create({
      data: dto,
    });
    return cliente;
  }

  async buscarTodos() {
    return this.prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { obras: true } },
      },
    });
  }

  async buscarPorId(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        obras: {
          select: {
            id: true,
            nome: true,
            status: true,
            etapaAtual: true,
            createdAt: true,
          },
        },
      },
    });

    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return cliente;
  }

  async atualizar(id: string, dto: AtualizarClienteDto) {
    await this.buscarPorId(id);

    return this.prisma.cliente.update({
      where: { id },
      data: dto,
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);

    await this.prisma.cliente.delete({ where: { id } });
    return { mensagem: 'Cliente removido com sucesso' };
  }
}