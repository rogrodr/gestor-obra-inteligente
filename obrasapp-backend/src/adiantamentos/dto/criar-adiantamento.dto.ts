import { IsString, IsNumber, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CriarAdiantamentoDto {
  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  @IsNotEmpty()
  trabalhadorId: string;

  @IsString()
  @IsNotEmpty()
  obraId: string;
}