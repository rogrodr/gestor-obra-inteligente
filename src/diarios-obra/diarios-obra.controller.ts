import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiariosObraService } from './diarios-obra.service';
import { CriarDiarioObraDto } from './dto/criar-diario-obra.dto';
import { AtualizarDiarioObraDto } from './dto/atualizar-diario-obra.dto';

@Controller('diarios-obra')
export class DiariosObraController {
  constructor(private readonly diariosObraService: DiariosObraService) {}

  @Post()
  criar(@Body() criarDto: CriarDiarioObraDto) {
    return this.diariosObraService.criar(criarDto);
  }

  @Get()
  buscarTodos(@Query('obraId') obraId: string) {
    return this.diariosObraService.buscarTodosPorObra(obraId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.diariosObraService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() atualizarDto: AtualizarDiarioObraDto) {
    return this.diariosObraService.atualizar(id, atualizarDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.diariosObraService.remover(id);
  }
}