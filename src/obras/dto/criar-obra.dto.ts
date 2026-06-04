import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { StatusObra, EtapaObra } from '@prisma/client';

export class CriarObraDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

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

  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsString()
  clienteId: string;
}