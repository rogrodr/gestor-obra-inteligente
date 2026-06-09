import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdiantamentosService } from './adiantamentos.service';
import { CriarAdiantamentoDto } from './dto/criar-adiantamento.dto';
import { AtualizarAdiantamentoDto } from './dto/atualizar-adiantamento.dto';

@Controller('adiantamentos')
export class AdiantamentosController {
  constructor(private readonly adiantamentosService: AdiantamentosService) {}

  @Post()
  criar(@Body() criarDto: CriarAdiantamentoDto) {
    return this.adiantamentosService.criar(criarDto);
  }

  @Get()
  buscarTodos(@Query('obraId') obraId: string) {
    return this.adiantamentosService.buscarTodosPorObra(obraId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.adiantamentosService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() atualizarDto: AtualizarAdiantamentoDto) {
    return this.adiantamentosService.atualizar(id, atualizarDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.adiantamentosService.remover(id);
  }
}