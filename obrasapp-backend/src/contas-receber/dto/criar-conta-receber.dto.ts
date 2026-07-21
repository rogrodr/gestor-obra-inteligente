import {
  IsNotEmpty,
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

export class CriarContaReceberDto {
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString()
  descricao: string;

  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor: number;

  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @IsDateString()
  dataVencimento: string;

  @IsOptional()
  @IsEnum(TipoContaReceber)
  tipo?: TipoContaReceber;

  @IsOptional()
  @IsEnum(EtapaObra)
  etapaVinculada?: EtapaObra;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;
}