import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CriarClienteDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;
}