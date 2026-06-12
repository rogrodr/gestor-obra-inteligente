import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ServicoAvulsoService } from './servico-avulso.service';
import { CriarServicoAvulsoDto } from './dto/criar-servico-avulso.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('servicos-avulsos')
export class ServicoAvulsoController {
  constructor(private servicoAvulsoService: ServicoAvulsoService) {}

  // POST /api/servicos-avulsos
  @Post()
  criar(@Body() dto: CriarServicoAvulsoDto) {
    return this.servicoAvulsoService.criar(dto);
  }

  // GET /api/servicos-avulsos/obra/:obraId
  @Get('obra/:obraId')
  buscarPorObra(@Param('obraId') obraId: string) {
    return this.servicoAvulsoService.buscarPorObra(obraId);
  }

  // DELETE /api/servicos-avulsos/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.servicoAvulsoService.remover(id);
  }
}