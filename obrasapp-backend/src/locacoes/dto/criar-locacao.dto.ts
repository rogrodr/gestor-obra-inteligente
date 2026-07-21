import { IsString, IsNumber, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CriarLocacaoDto {
  @IsString()
  @IsNotEmpty()
  equipamento: string;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsDateString()
  @IsNotEmpty()
  dataFimPrevista: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  locador?: string;

  @IsString()
  @IsNotEmpty()
  obraId: string;
}