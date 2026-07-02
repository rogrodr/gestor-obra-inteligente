import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { TipoContrato } from '@prisma/client'; // 👈 Importar o Enum do Prisma

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

  @IsOptional() // Colocamos como opcional para não quebrar a IA que não preenche isso
  @IsEnum(TipoContrato, { message: 'Tipo de contrato inválido' })
  tipoContrato?: TipoContrato; // 👈 Campo novo
}