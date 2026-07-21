import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEmpresaDto } from './dto/criar-empresa.dto';
import { AtualizarEmpresaDto } from './dto/atualizar-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarEmpresaDto, usuarioId: string) {
    const existe = await this.prisma.empresa.findUnique({
      where: { usuarioId },
    });

    if (existe) throw new ConflictException('Usuário já possui uma empresa cadastrada');

    return this.prisma.empresa.create({
      data: { ...dto, usuarioId },
    });
  }

  async buscarPorUsuario(usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId },
    });

    if (!empresa) throw new NotFoundException('Empresa não cadastrada');
    return empresa;
  }

  async atualizar(usuarioId: string, dto: AtualizarEmpresaDto) {
    await this.buscarPorUsuario(usuarioId);

    return this.prisma.empresa.update({
      where: { usuarioId },
      data: dto,
    });
  }
}