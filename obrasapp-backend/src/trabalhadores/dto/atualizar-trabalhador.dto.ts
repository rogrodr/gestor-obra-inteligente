import { IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { TipoContrato } from '@prisma/client';

export class AtualizarTrabalhadorDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  funcao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'Valor por dia deve ser maior que zero' })
  valorDia?: number;

  @IsOptional()
  @IsEnum(TipoContrato, { message: 'Tipo de contrato inválido' })
  tipoContrato?: TipoContrato;
}