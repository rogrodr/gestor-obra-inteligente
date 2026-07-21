import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { StatusObra, EtapaObra } from '@prisma/client';
import { Transform } from 'class-transformer'; // 👈 IMPORTANTE: Adicione este import

export class CriarObraDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsEnum(StatusObra)
  status?: StatusObra;

  @IsOptional()
  @IsEnum(EtapaObra)
  etapaAtual?: EtapaObra;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsString({ message: 'O cliente informado deve ser válido' })
  @Transform(({ value }) => {
    // 💡 Se o frontend enviar o objeto inteiro do cliente { id: '...', nome: '...' }
    // nós extraímos automaticamente apenas a string do ID
    if (value && typeof value === 'object' && value.id) {
      return value.id;
    }
    return value;
  })
  clienteId: string;
}