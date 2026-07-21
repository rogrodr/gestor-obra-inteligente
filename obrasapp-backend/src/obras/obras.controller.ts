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
import { ObrasService } from './obras.service';
import { CriarObraDto } from './dto/criar-obra.dto';
import { AtualizarObraDto } from './dto/atualizar-obra.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('obras')
export class ObrasController {
  constructor(private obrasService: ObrasService) {}

  // POST /api/obras
  @Post()
  criar(@Body() dto: CriarObraDto, @Req() req: any) {
    return this.obrasService.criar(dto, req.user.id);
  }

  // GET /api/obras/dashboard
  @Get('dashboard')
  dashboard(@Req() req: any) {
    return this.obrasService.dashboard(req.user.id);
  }

  // GET /api/obras/fluxo-caixa?ano=2026
  @Get('fluxo-caixa')
  fluxoCaixa(@Req() req: any, @Query('ano') ano: string) {
    return this.obrasService.fluxoCaixaMensal(req.user.id, parseInt(ano) || new Date().getFullYear());
  }

  // GET /api/obras
  @Get()
  buscarTodas(@Req() req: any) {
    return this.obrasService.buscarTodas(req.user.id);
  }

  // GET /api/obras/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string, @Req() req: any) {
    return this.obrasService.buscarPorId(id, req.user.id);
  }

  // PUT /api/obras/:id
  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarObraDto, @Req() req: any) {
    return this.obrasService.atualizar(id, dto, req.user.id);
  }

  // DELETE /api/obras/:id
  @Delete(':id')
  remover(@Param('id') id: string, @Req() req: any) {
    return this.obrasService.remover(id, req.user.id);
  }

  // GET /api/obras/:id/resumo
  @Get(':id/resumo')
  resumoFinanceiro(@Param('id') id: string, @Req() req: any) {
    return this.obrasService.resumoFinanceiro(id, req.user.id);
  }


  @Get(':id/pendencias')
pendencias(@Param('id') id: string, @Req() req: any) {
  return this.obrasService.pendencias(id, req.user.id);
}
}