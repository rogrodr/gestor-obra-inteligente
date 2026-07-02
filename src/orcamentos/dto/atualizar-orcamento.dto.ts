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
  @IsString()
  clienteId?: string;

  // Permite vincular um cliente real depois que o orçamento já existia como rascunho
  @IsOptional()
  @IsString()
  nomeClienteTemporario?: string;

  @IsOptional()
  @IsString()
  telefoneClienteTemporario?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O valor final deve ser um número' })
  @Min(0, { message: 'O valor final não pode ser negativo' })
  valorFinal?: number;

  @IsOptional()
  @IsEnum(StatusOrcamento, { message: 'Status inválido' })
  status?: StatusOrcamento;

  @IsOptional()
  @IsArray({ message: 'itens deve ser uma matriz (array)' })
  @ValidateNested({ each: true })
  @Type(() => ItemOrcamentoDto)
  itens?: ItemOrcamentoDto[];
}