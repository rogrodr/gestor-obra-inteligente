import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTrabalhadorDto } from './dto/criar-trabalhador.dto';
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
          orderBy: { createdAt: 'desc' },
          include: {
            obra: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!trabalhador) throw new NotFoundException('Trabalhador não encontrado');
    return trabalhador;
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
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
      include: {
        obra: { select: { id: true, nome: true } },
      },
    });

    const totalReceber = presencas.reduce((acc, p) => acc + p.total, 0);

    return { presencas, totalReceber };
  }

  async removerPresenca(id: string) {
    const presenca = await this.prisma.presenca.findUnique({ where: { id } });
    if (!presenca) throw new NotFoundException('Presença não encontrada');

    await this.prisma.presenca.delete({ where: { id } });
    return { mensagem: 'Presença removida com sucesso' };
  }
}