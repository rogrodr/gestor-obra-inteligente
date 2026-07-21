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
  Req,
} from '@nestjs/common';
import { ContasReceberService } from './contas-receber.service';
import { CriarContaReceberDto } from './dto/criar-conta-receber.dto';
import { AtualizarContaReceberDto } from './dto/atualizar-conta-receber.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('contas-receber')
export class ContasReceberController {
  constructor(private contasReceberService: ContasReceberService) {}

  // POST /api/contas-receber
  @Post()
  criar(@Body() dto: CriarContaReceberDto, @Req() req: any) {
    return this.contasReceberService.criar(dto, req.user.id);
  }

  // GET /api/contas-receber
  @Get()
  buscarTodos(@Req() req: any) {
    return this.contasReceberService.buscarTodos(req.user.id);
  }

  // GET /api/contas-receber/obra/:obraId
  @Get('obra/:obraId')
  buscarPorObra(@Param('obraId') obraId: string, @Req() req: any) {
    return this.contasReceberService.buscarPorObra(obraId, req.user.id);
  }

  // GET /api/contas-receber/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string, @Req() req: any) {
    return this.contasReceberService.buscarPorId(id, req.user.id);
  }

  // PUT /api/contas-receber/:id
  @Put(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarContaReceberDto,
    @Req() req: any,
  ) {
    return this.contasReceberService.atualizar(id, dto, req.user.id);
  }

  // PATCH /api/contas-receber/:id/receber
  // Marca como recebido e cria lançamento de ENTRADA automaticamente
  @Patch(':id/receber')
  marcarRecebido(@Param('id') id: string, @Req() req: any) {
    return this.contasReceberService.marcarRecebido(id, req.user.id);
  }

  // DELETE /api/contas-receber/:id
  @Delete(':id')
  remover(@Param('id') id: string, @Req() req: any) {
    return this.contasReceberService.remover(id, req.user.id);
  }
}