import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import {
  TipoContaReceber,
  StatusContaReceber,
  EtapaObra,
} from '@prisma/client';

export class AtualizarContaReceberDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  valor?: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @IsOptional()
  @IsEnum(TipoContaReceber)
  tipo?: TipoContaReceber;

  @IsOptional()
  @IsEnum(StatusContaReceber)
  status?: StatusContaReceber;

  @IsOptional()
  @IsEnum(EtapaObra)
  etapaVinculada?: EtapaObra;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;
}