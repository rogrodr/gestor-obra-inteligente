import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IaService } from './ia.service';
import { JwtGuard } from '../autenticacao/guards/jwt.guard';
import { IsNotEmpty, IsString } from 'class-validator';

class ComandoVozDto {
  @IsNotEmpty({ message: 'Texto é obrigatório' })
  @IsString()
  texto: string;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;
}

@UseGuards(JwtGuard)
@Controller('ia')
export class IaController {
  constructor(private iaService: IaService) {}

  // POST /api/ia/comando
  @Post('comando')
  executarComando(@Body() dto: ComandoVozDto, @Req() req: any) {
    return this.iaService.executarComando(dto.texto, dto.obraId, req.user.id);
  }
}