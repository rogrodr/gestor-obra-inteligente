import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarLocacaoDto } from './dto/criar-locacao.dto';
import { AtualizarLocacaoDto } from './dto/atualizar-locacao.dto';

@Injectable()
export class LocacoesService {
  constructor(private prisma: PrismaService) {}

  async criar(criarDto: CriarLocacaoDto) {
    return this.prisma.locacao.create({
      data: {
        equipamento: criarDto.equipamento,
        valor: criarDto.valor,
        dataInicio: criarDto.dataInicio ? new Date(criarDto.dataInicio) : undefined,
        dataFimPrevista: new Date(criarDto.dataFimPrevista),
        status: criarDto.status,
        locador: criarDto.locador,
        obraId: criarDto.obraId,
      },
    });
  }

  async buscarTodosPorObra(obraId: string) {
    return this.prisma.locacao.findMany({
      where: { obraId },
    });
  }

  async buscarPorId(id: string) {
    const locacao = await this.prisma.locacao.findUnique({
      where: { id },
    });
    if (!locacao) throw new NotFoundException('Locação não encontrada');
    return locacao;
  }

  async atualizar(id: string, atualizarDto: AtualizarLocacaoDto) {
    await this.buscarPorId(id);
    return this.prisma.locacao.update({
      where: { id },
      data: {
        equipamento: atualizarDto.equipamento,
        valor: atualizarDto.valor,
        dataInicio: atualizarDto.dataInicio ? new Date(atualizarDto.dataInicio) : undefined,
        dataFimPrevista: atualizarDto.dataFimPrevista ? new Date(atualizarDto.dataFimPrevista) : undefined,
        dataDevolucao: atualizarDto.dataDevolucao ? new Date(atualizarDto.dataDevolucao) : undefined,
        status: atualizarDto.status,
        locador: atualizarDto.locador,
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    return this.prisma.locacao.delete({
      where: { id },
    });
  }
}