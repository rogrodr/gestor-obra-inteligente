import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemOrcamentoDto {
  @IsNotEmpty({ message: 'Descrição do item é obrigatória' })
  @IsString()
  descricao: string;

  @IsNumber()
  @Min(0.01)
  quantidade: number;

  @IsNumber()
  @Min(0.01)
  valorUnitario: number;
}

export class CriarOrcamentoDto {
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsString()
  clienteId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrcamentoDto)
  itens?: ItemOrcamentoDto[];
}