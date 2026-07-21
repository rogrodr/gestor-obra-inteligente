import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { TipoLancamento, OrigemLancamento } from '@prisma/client';

export class CriarLancamentoDto {
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString()
  descricao: string;

  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor: number;

  @IsEnum(TipoLancamento, { message: 'Tipo deve ser ENTRADA ou SAIDA' })
  tipo: TipoLancamento;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsEnum(OrigemLancamento)
  origem?: OrigemLancamento;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;
}