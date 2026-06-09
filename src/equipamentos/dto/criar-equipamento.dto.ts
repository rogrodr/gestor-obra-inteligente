import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { StatusEquipamento } from '@prisma/client';

export class CriarEquipamentoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(StatusEquipamento)
  @IsNotEmpty()
  status: StatusEquipamento;

  @IsOptional()
  @IsString()
  trabalhadorId?: string;

  @IsOptional()
  @IsString()
  obraId?: string;
}