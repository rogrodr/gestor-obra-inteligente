import { IsString, IsOptional, IsEnum } from 'class-validator';
import { StatusMaterial } from '@prisma/client';

export class AtualizarMaterialDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(StatusMaterial)
  status?: StatusMaterial;
}