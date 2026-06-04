import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';
import type { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private relatoriosService: RelatoriosService) {}

  // GET /api/relatorios/obra/:id
  @Get('obra/:id')
  relatorioObra(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.relatoriosService.gerarRelatorioObra(id, req.user.id, res);
  }

  // GET /api/relatorios/trabalhador/:id
  @Get('trabalhador/:id')
  relatorioTrabalhador(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.relatoriosService.gerarRelatorioTrabalhador(id, req.user.id, res);
  }

  // GET /api/relatorios/orcamento/:id
  @Get('orcamento/:id')
  relatorioOrcamento(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.relatoriosService.gerarOrcamentoPdf(id, req.user.id, res);
  }
}