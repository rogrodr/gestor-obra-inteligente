import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CriarEmpresaDto {
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString()
  razaoSocial: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString()
  cnpj: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cep?: string;
}