import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarMaterialDto } from './dto/criar-material.dto';
import { AtualizarMaterialDto } from './dto/atualizar-material.dto';

@Injectable()
export class MateriaisService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarMaterialDto) {
    return this.prisma.material.create({
      data: dto,
      include: { obra: { select: { id: true, nome: true } } },
    });
  }

  async buscarPorObra(obraId: string) {
    const materiais = await this.prisma.material.findMany({
      where: { obraId },
      orderBy: { createdAt: 'desc' },
    });

    const pendentes = materiais.filter((m) => m.status === 'PENDENTE').length;
    const comprados = materiais.filter((m) => m.status === 'COMPRADO').length;

    return { materiais, pendentes, comprados, total: materiais.length };
  }

  async atualizar(id: string, dto: AtualizarMaterialDto) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material não encontrado');

    return this.prisma.material.update({
      where: { id },
      data: dto,
    });
  }

  async marcarComprado(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material não encontrado');

    return this.prisma.material.update({
      where: { id },
      data: { status: 'COMPRADO' },
    });
  }

  async remover(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material não encontrado');

    await this.prisma.material.delete({ where: { id } });
    return { mensagem: 'Material removido com sucesso' };
  }
}