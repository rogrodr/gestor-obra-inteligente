import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Perfil } from '@prisma/client';

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha?: string;

  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}