import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';
import { CriarLancamentoDto } from './dto/criar-lancamento.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';
import { IsNotEmpty, IsString } from 'class-validator';

class ProcessarVozDto {
  @IsNotEmpty()
  @IsString()
  texto: string;

  @IsNotEmpty()
  @IsString()
  obraId: string;
}

@UseGuards(JwtGuard)
@Controller('lancamentos')
export class LancamentosController {
  constructor(private lancamentosService: LancamentosService) {}

  // POST /api/lancamentos
  @Post()
  criar(@Body() dto: CriarLancamentoDto) {
    return this.lancamentosService.criar(dto);
  }

  // GET /api/lancamentos/obra/:obraId
  // Filtros opcionais: ?categoria=Equipamentos&tipo=SAIDA
  // Exemplos:
  //   /api/lancamentos/obra/:id                          → todos
  //   /api/lancamentos/obra/:id?tipo=SAIDA               → só saídas
  //   /api/lancamentos/obra/:id?categoria=Equipamentos   → só equipamentos
  //   /api/lancamentos/obra/:id?categoria=Materiais      → só materiais
  //   /api/lancamentos/obra/:id?categoria=Transporte     → só transporte
  @Get('obra/:obraId')
  buscarPorObra(
    @Param('obraId') obraId: string,
    @Query('categoria') categoria?: string,
    @Query('tipo') tipo?: 'ENTRADA' | 'SAIDA',
  ) {
    return this.lancamentosService.buscarPorObra(obraId, categoria, tipo);
  }

  // GET /api/lancamentos/obra/:obraId/categorias
  // Retorna um resumo de quanto foi gasto por categoria nessa obra
  @Get('obra/:obraId/categorias')
  resumoPorCategoria(@Param('obraId') obraId: string) {
    return this.lancamentosService.resumoPorCategoria(obraId);
  }

  // DELETE /api/lancamentos/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.lancamentosService.remover(id);
  }

  // POST /api/lancamentos/voz
  @Post('voz')
  processarVoz(@Body() dto: ProcessarVozDto) {
    return this.lancamentosService.processarVoz(dto.texto, dto.obraId);
  }
}