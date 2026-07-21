import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { StatusMaterial } from '@prisma/client';

export class CriarMaterialDto {
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString()
  descricao: string;

  @IsOptional()
  @IsEnum(StatusMaterial)
  status?: StatusMaterial;

  @IsNotEmpty({ message: 'Obra é obrigatória' })
  @IsString()
  obraId: string;
}