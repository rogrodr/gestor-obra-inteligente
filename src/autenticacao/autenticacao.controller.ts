import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private autenticacaoService: AutenticacaoService) {}

  @Post('registrar')
  registrar(@Body() dto: RegistroDto) {
    return this.autenticacaoService.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.autenticacaoService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get('eu')
  eu(@Req() req: any) {
    return req.user;
  }
}