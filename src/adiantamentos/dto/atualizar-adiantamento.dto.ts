import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class AtualizarAdiantamentoDto {
  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}