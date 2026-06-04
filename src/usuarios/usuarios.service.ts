import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async buscarTodos() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
        _count: { select: { obras: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
        obras: {
          select: {
            id: true,
            nome: true,
            status: true,
            etapaAtual: true,
          },
        },
      },
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto) {
    await this.buscarPorId(id);

    const dados: any = { ...dto };

    if (dto.senha) {
      dados.senha = await bcrypt.hash(dto.senha, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        updatedAt: true,
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { mensagem: 'Usuário removido com sucesso' };
  }
}