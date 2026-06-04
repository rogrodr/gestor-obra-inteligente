import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CriarTrabalhadorDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'Função é obrigatória' })
  @IsString()
  funcao: string;

  @IsNumber()
  @Min(0.01, { message: 'Valor por dia deve ser maior que zero' })
  valorDia: number;
}