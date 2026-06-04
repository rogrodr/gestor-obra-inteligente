import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  // GET /api/usuarios
  @Get()
  buscarTodos() {
    return this.usuariosService.buscarTodos();
  }

  // GET /api/usuarios/perfil
  @Get('perfil')
  meuPerfil(@Req() req: any) {
    return this.usuariosService.buscarPorId(req.user.id);
  }

  // GET /api/usuarios/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  // PUT /api/usuarios/:id
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarUsuarioDto) {
    return this.usuariosService.atualizar(id, dto);
  }

  // DELETE /api/usuarios/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.usuariosService.remover(id);
  }
}