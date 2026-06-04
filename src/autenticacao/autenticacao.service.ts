import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticacaoService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registrar(dto: RegistroDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existe) throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha: senhaHash,
        perfil: dto.perfil ?? 'ADMIN',
      },
    });

    const { senha, ...resultado } = usuario;
    return {
      mensagem: 'Usuário criado com sucesso',
      usuario: resultado,
      access_token: this.gerarToken(usuario.id, usuario.email),
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) throw new UnauthorizedException('E-mail ou senha inválidos');

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
    if (!senhaValida) throw new UnauthorizedException('E-mail ou senha inválidos');

    const { senha, ...resultado } = usuario;
    return {
      mensagem: 'Login realizado com sucesso',
      usuario: resultado,
      access_token: this.gerarToken(usuario.id, usuario.email),
    };
  }

  private gerarToken(usuarioId: string, email: string) {
    return this.jwt.sign({
      sub: usuarioId,
      email,
    });
  }
}