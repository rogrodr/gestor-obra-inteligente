import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { TrabalhadoresService } from './trabalhadores.service';
import { CriarTrabalhadorDto } from './dto/criar-trabalhador.dto';
import { AtualizarTrabalhadorDto } from './dto/atualizar-trabalhador.dto';
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

  // POST /api/trabalhadores/presenca
  // ⚠️ Precisa vir ANTES de :id para não conflitar
  @Post('presenca')
  registrarPresenca(@Body() dto: CriarPresencaDto) {
    return this.trabalhadoresService.registrarPresenca(dto);
  }

  // GET /api/trabalhadores/presenca/obra/:obraId
  @Get('presenca/obra/:obraId')
  buscarPresencasPorObra(@Param('obraId') obraId: string) {
    return this.trabalhadoresService.buscarPresencasPorObra(obraId);
  }

  // DELETE /api/trabalhadores/presenca/:id
  @Delete('presenca/:id')
  removerPresenca(@Param('id') id: string) {
    return this.trabalhadoresService.removerPresenca(id);
  }

  // GET /api/trabalhadores/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.trabalhadoresService.buscarPorId(id);
  }

  // PATCH /api/trabalhadores/:id
  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarTrabalhadorDto) {
    return this.trabalhadoresService.atualizar(id, dto);
  }

  // PATCH /api/trabalhadores/:id/desativar
  @Patch(':id/desativar')
  desativar(@Param('id') id: string) {
    return this.trabalhadoresService.desativar(id);
  }

  // GET /api/trabalhadores/:id/presencas
  @Get(':id/presencas')
  buscarPresencasPorTrabalhador(@Param('id') id: string) {
    return this.trabalhadoresService.buscarPresencasPorTrabalhador(id);
  }

  // GET /api/trabalhadores/:id/extrato?obraId=xxx (obraId opcional)
  // Retorna histórico consolidado: presenças + adiantamentos + saldo líquido
  @Get(':id/extrato')
  extrato(
    @Param('id') id: string,
    @Query('obraId') obraId?: string,
  ) {
    return this.trabalhadoresService.extrato(id, obraId);
  }
}