import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { CriarMaterialDto } from './dto/criar-material.dto';
import { AtualizarMaterialDto } from './dto/atualizar-material.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('materiais')
export class MateriaisController {
  constructor(private materiaisService: MateriaisService) {}

  // POST /api/materiais
  @Post()
  criar(@Body() dto: CriarMaterialDto) {
    return this.materiaisService.criar(dto);
  }

  // GET /api/materiais/obra/:obraId
  @Get('obra/:obraId')
  buscarPorObra(@Param('obraId') obraId: string) {
    return this.materiaisService.buscarPorObra(obraId);
  }

  // PUT /api/materiais/:id
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarMaterialDto) {
    return this.materiaisService.atualizar(id, dto);
  }

  // PATCH /api/materiais/:id/comprado
  @Patch(':id/comprado')
  marcarComprado(@Param('id') id: string) {
    return this.materiaisService.marcarComprado(id);
  }

  // DELETE /api/materiais/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.materiaisService.remover(id);
  }
}