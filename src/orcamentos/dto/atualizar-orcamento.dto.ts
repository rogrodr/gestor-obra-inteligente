import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { StatusOrcamento } from '@prisma/client';
import { Type } from 'class-transformer';
import { ItemOrcamentoDto } from './criar-orcamento.dto';

export class AtualizarOrcamentoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorFinal?: number;

  @IsOptional()
  @IsEnum(StatusOrcamento)
  status?: StatusOrcamento;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrcamentoDto)
  itens?: ItemOrcamentoDto[];
}