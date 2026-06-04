import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { AtualizarOrcamentoDto } from './dto/atualizar-orcamento.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('orcamentos')
export class OrcamentosController {
  constructor(private orcamentosService: OrcamentosService) {}

  // POST /api/orcamentos
  @Post()
  criar(@Body() dto: CriarOrcamentoDto, @Req() req: any) {
    return this.orcamentosService.criar(dto, req.user.id);
  }

  // GET /api/orcamentos
  @Get()
  buscarTodos(@Req() req: any) {
    return this.orcamentosService.buscarTodos(req.user.id);
  }

  // GET /api/orcamentos/recentes
  @Get('recentes')
  buscarRecentes(@Req() req: any) {
    return this.orcamentosService.buscarRecentes(req.user.id);
  }

  // GET /api/orcamentos/sugestoes?titulo=reboco
  @Get('sugestoes')
  buscarSugestoes(@Req() req: any, @Query('titulo') titulo: string) {
    return this.orcamentosService.buscarSugestoes(req.user.id, titulo);
  }

  // GET /api/orcamentos/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string, @Req() req: any) {
    return this.orcamentosService.buscarPorId(id, req.user.id);
  }

  // PUT /api/orcamentos/:id
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarOrcamentoDto, @Req() req: any) {
    return this.orcamentosService.atualizar(id, dto, req.user.id);
  }

  // DELETE /api/orcamentos/:id
  @Delete(':id')
  remover(@Param('id') id: string, @Req() req: any) {
    return this.orcamentosService.remover(id, req.user.id);
  }
}