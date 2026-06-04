import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CriarPresencaDto {
  @IsNotEmpty({ message: 'Trabalhador é obrigatório' })
  @IsString()
  trabalhadorId: string;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;

  @IsNumber()
  @Min(1)
  diasTrabalhados: number;

  @IsNumber()
  @Min(0.01)
  valorDia: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}