import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { StatusObra, EtapaObra } from '@prisma/client';

export class AtualizarObraDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsEnum(StatusObra)
  status?: StatusObra;

  @IsOptional()
  @IsEnum(EtapaObra)
  etapaAtual?: EtapaObra;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}