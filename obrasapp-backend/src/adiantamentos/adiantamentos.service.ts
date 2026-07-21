import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAdiantamentoDto } from './dto/criar-adiantamento.dto';
import { AtualizarAdiantamentoDto } from './dto/atualizar-adiantamento.dto';

@Injectable()
export class AdiantamentosService {
  constructor(private prisma: PrismaService) {}

  async criar(criarDto: CriarAdiantamentoDto) {
    return this.prisma.adiantamento.create({
      data: {
        valor: criarDto.valor,
        data: criarDto.data ? new Date(criarDto.data) : undefined,
        descricao: criarDto.descricao,
        trabalhadorId: criarDto.trabalhadorId,
        obraId: criarDto.obraId,
      },
    });
  }

  async buscarTodosPorObra(obraId: string) {
    return this.prisma.adiantamento.findMany({
      where: { obraId },
      include: { trabalhador: true },
    });
  }

  async buscarPorId(id: string) {
    const adiantamento = await this.prisma.adiantamento.findUnique({
      where: { id },
    });
    if (!adiantamento) throw new NotFoundException('Adiantamento não encontrado');
    return adiantamento;
  }

  async atualizar(id: string, atualizarDto: AtualizarAdiantamentoDto) {
    await this.buscarPorId(id);
    return this.prisma.adiantamento.update({
      where: { id },
      data: {
        valor: atualizarDto.valor,
        data: atualizarDto.data ? new Date(atualizarDto.data) : undefined,
        descricao: atualizarDto.descricao,
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    return this.prisma.adiantamento.delete({
      where: { id },
    });
  }
}