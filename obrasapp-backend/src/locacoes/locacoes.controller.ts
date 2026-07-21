import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LocacoesService } from './locacoes.service';
import { CriarLocacaoDto } from './dto/criar-locacao.dto';
import { AtualizarLocacaoDto } from './dto/atualizar-locacao.dto';

@Controller('locacoes')
export class LocacoesController {
  constructor(private readonly locacoesService: LocacoesService) {}

  @Post()
  criar(@Body() criarDto: CriarLocacaoDto) {
    return this.locacoesService.criar(criarDto);
  }

  @Get()
  buscarTodos(@Query('obraId') obraId: string) {
    return this.locacoesService.buscarTodosPorObra(obraId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.locacoesService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() atualizarDto: AtualizarLocacaoDto) {
    return this.locacoesService.atualizar(id, atualizarDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.locacoesService.remover(id);
  }
}