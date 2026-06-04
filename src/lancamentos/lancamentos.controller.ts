import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
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
  @Get('obra/:obraId')
  buscarPorObra(@Param('obraId') obraId: string) {
    return this.lancamentosService.buscarPorObra(obraId);
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