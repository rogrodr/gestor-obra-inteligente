import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}

  async criar(criarDto: CriarEquipamentoDto) {
    return this.prisma.equipamento.create({
      data: {
        nome: criarDto.nome,
        status: criarDto.status,
        trabalhadorId: criarDto.trabalhadorId || null,
        obraId: criarDto.obraId || null,
      },
    });
  }

  async buscarTodos() {
    return this.prisma.equipamento.findMany({
      include: { obra: true, trabalhador: true },
    });
  }

  async buscarPorId(id: string) {
    const equipamento = await this.prisma.equipamento.findUnique({
      where: { id },
      include: { obra: true, trabalhador: true },
    });
    if (!equipamento) throw new NotFoundException('Equipamento não encontrado');
    return equipamento;
  }

  async atualizar(id: string, atualizarDto: AtualizarEquipamentoDto) {
    await this.buscarPorId(id);
    return this.prisma.equipamento.update({
      where: { id },
      data: {
        nome: atualizarDto.nome,
        status: atualizarDto.status,
        trabalhadorId: atualizarDto.trabalhadorId === undefined ? undefined : atualizarDto.trabalhadorId,
        obraId: atualizarDto.obraId === undefined ? undefined : atualizarDto.obraId,
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    return this.prisma.equipamento.delete({
      where: { id },
    });
  }
}