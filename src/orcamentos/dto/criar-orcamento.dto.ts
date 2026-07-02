import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusOrcamento } from '@prisma/client';

export class ItemOrcamentoDto {
  @IsNotEmpty({ message: 'Descrição do item é obrigatória' })
  @IsString()
  descricao: string;

  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0.01, { message: 'A quantidade deve ser maior que zero' })
  quantidade: number;

  @IsNumber({}, { message: 'O valor unitário deve ser um número' })
  @Min(0.01, { message: 'O valor unitário deve ser maior que zero' })
  valorUnitario: number;
}

export class CriarOrcamentoDto {
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  // Agora opcional: orçamento pode existir sem cliente formalmente cadastrado
  @IsOptional()
  @IsString()
  clienteId?: string;

  // Usado quando ainda não existe cadastro de cliente
  @IsOptional()
  @IsString()
  nomeClienteTemporario?: string;

  @IsOptional()
  @IsString()
  telefoneClienteTemporario?: string;

  @IsOptional()
  @IsEnum(StatusOrcamento, { message: 'Status inválido' })
  status?: StatusOrcamento;

  @IsOptional()
  @IsArray({ message: 'itens deve ser uma matriz (array)' })
  @ValidateNested({ each: true })
  @Type(() => ItemOrcamentoDto)
  itens?: ItemOrcamentoDto[];
}