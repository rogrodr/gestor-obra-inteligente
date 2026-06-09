import { IsString, IsOptional, IsDateString, IsArray, IsNotEmpty } from 'class-validator';

export class CriarDiarioObraDto {
  @IsOptional()
  @IsDateString()
  data?: string;

  @IsString()
  @IsNotEmpty()
  clima: string;

  @IsString()
  @IsNotEmpty()
  atividades: string;

  @IsArray()
  @IsString({ each: true })
  fotos: string[];

  @IsString()
  @IsNotEmpty()
  obraId: string;
}