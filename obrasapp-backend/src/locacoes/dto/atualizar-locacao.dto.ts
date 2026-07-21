import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class AtualizarLocacaoDto {
  @IsOptional()
  @IsString()
  equipamento?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFimPrevista?: string;

  @IsOptional()
  @IsDateString()
  dataDevolucao?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  locador?: string;
}