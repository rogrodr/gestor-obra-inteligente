import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/criar-cliente.dto';
import { AtualizarClienteDto } from './dto/atualizar-cliente.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  // POST /api/clientes
  @Post()
  criar(@Body() dto: CriarClienteDto) {
    return this.clientesService.criar(dto);
  }

  // GET /api/clientes
  @Get()
  buscarTodos() {
    return this.clientesService.buscarTodos();
  }

  // GET /api/clientes/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.clientesService.buscarPorId(id);
  }

  // PUT /api/clientes/:id
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarClienteDto) {
    return this.clientesService.atualizar(id, dto);
  }

  // DELETE /api/clientes/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.clientesService.remover(id);
  }
}