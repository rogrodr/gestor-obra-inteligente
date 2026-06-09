import { IsString, IsOptional, IsEnum } from 'class-validator';
import { StatusEquipamento } from '@prisma/client';

export class AtualizarEquipamentoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEnum(StatusEquipamento)
  status?: StatusEquipamento;

  @IsOptional()
  @IsString()
  trabalhadorId?: string;

  @IsOptional()
  @IsString()
  obraId?: string;
}