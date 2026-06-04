import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MaoDeObraService } from './mao-de-obra.service';
import { CriarMaoDeObraDto } from './dto/criar-mao-de-obra.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('mao-de-obra')
export class MaoDeObraController {
  constructor(private maoDeObraService: MaoDeObraService) {}

  // POST /api/mao-de-obra
  @Post()
  criar(@Body() dto: CriarMaoDeObraDto) {
    return this.maoDeObraService.criar(dto);
  }

  // GET /api/mao-de-obra/obra/:obraId
  @Get('obra/:obraId')
  buscarPorObra(@Param('obraId') obraId: string) {
    return this.maoDeObraService.buscarPorObra(obraId);
  }

  // DELETE /api/mao-de-obra/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.maoDeObraService.remover(id);
  }
}