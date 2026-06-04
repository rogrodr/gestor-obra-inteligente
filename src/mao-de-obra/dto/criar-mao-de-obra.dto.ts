import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CriarMaoDeObraDto {
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString()
  descricao: string;

  @IsNumber()
  @Min(1, { message: 'Dias trabalhados deve ser maior que zero' })
  diasTrabalhados: number;

  @IsNumber()
  @Min(0.01, { message: 'Valor por dia deve ser maior que zero' })
  valorPorDia: number;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;
}