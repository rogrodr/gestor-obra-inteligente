import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TrabalhadoresService } from './trabalhadores.service';
import { CriarTrabalhadorDto } from './dto/criar-trabalhador.dto';
import { CriarPresencaDto } from './dto/criar-presenca.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('trabalhadores')
export class TrabalhadoresController {
  constructor(private trabalhadoresService: TrabalhadoresService) {}

  // POST /api/trabalhadores
  @Post()
  criar(@Body() dto: CriarTrabalhadorDto) {
    return this.trabalhadoresService.criar(dto);
  }

  // GET /api/trabalhadores
  @Get()
  buscarTodos() {
    return this.trabalhadoresService.buscarTodos();
  }

  // GET /api/trabalhadores/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.trabalhadoresService.buscarPorId(id);
  }

  // PATCH /api/trabalhadores/:id/desativar
  @Patch(':id/desativar')
  desativar(@Param('id') id: string) {
    return this.trabalhadoresService.desativar(id);
  }

  // POST /api/trabalhadores/presenca
  @Post('presenca')
  registrarPresenca(@Body() dto: CriarPresencaDto) {
    return this.trabalhadoresService.registrarPresenca(dto);
  }

  // GET /api/trabalhadores/presenca/obra/:obraId
  @Get('presenca/obra/:obraId')
  buscarPresencasPorObra(@Param('obraId') obraId: string) {
    return this.trabalhadoresService.buscarPresencasPorObra(obraId);
  }

  // GET /api/trabalhadores/:id/presencas
  @Get(':id/presencas')
  buscarPresencasPorTrabalhador(@Param('id') id: string) {
    return this.trabalhadoresService.buscarPresencasPorTrabalhador(id);
  }

  // DELETE /api/trabalhadores/presenca/:id
  @Delete('presenca/:id')
  removerPresenca(@Param('id') id: string) {
    return this.trabalhadoresService.removerPresenca(id);
  }
}