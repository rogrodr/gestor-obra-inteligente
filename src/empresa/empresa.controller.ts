import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CriarEmpresaDto } from './dto/criar-empresa.dto';
import { AtualizarEmpresaDto } from './dto/atualizar-empresa.dto';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('empresa')
export class EmpresaController {
  constructor(private empresaService: EmpresaService) {}

  // POST /api/empresa
  @Post()
  criar(@Body() dto: CriarEmpresaDto, @Req() req: any) {
    return this.empresaService.criar(dto, req.user.id);
  }

  // GET /api/empresa
  @Get()
  buscar(@Req() req: any) {
    return this.empresaService.buscarPorUsuario(req.user.id);
  }

  // PUT /api/empresa
  @Put()
  atualizar(@Body() dto: AtualizarEmpresaDto, @Req() req: any) {
    return this.empresaService.atualizar(req.user.id, dto);
  }
}