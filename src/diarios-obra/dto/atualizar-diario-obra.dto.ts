import { IsString, IsOptional } from 'class-validator';

export class AtualizarDiarioObraDto {
  @IsOptional()
  @IsString()
  clima?: string;

  @IsOptional()
  @IsString()
  atividades?: string;
}