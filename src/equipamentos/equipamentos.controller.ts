import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { CriarEquipamentoDto } from './dto/criar-equipamento.dto';
import { AtualizarEquipamentoDto } from './dto/atualizar-equipamento.dto';

@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  criar(@Body() criarDto: CriarEquipamentoDto) {
    return this.equipamentosService.criar(criarDto);
  }

  @Get()
  buscarTodos() {
    return this.equipamentosService.buscarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.equipamentosService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() atualizarDto: AtualizarEquipamentoDto) {
    return this.equipamentosService.atualizar(id, atualizarDto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.equipamentosService.remover(id);
  }
}