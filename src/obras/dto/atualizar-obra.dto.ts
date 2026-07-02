import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { StatusObra, EtapaObra } from '@prisma/client';
import { Transform } from 'class-transformer'; // 👈 IMPORTANTE: Adicione este import

export class AtualizarObraDto {
  @IsOptional()
  @IsString()
  nome?: string;

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

  @IsOptional() // 👈 Na atualização o cliente é opcional
  @IsString({ message: 'O cliente informado deve ser válido' })
  @Transform(({ value }) => {
    // 💡 Mesma limpeza: se vier objeto, vira string de ID
    if (value && typeof value === 'object' && value.id) {
      return value.id;
    }
    return value;
  })
  clienteId?: string; // 👈 ADICIONADO: Agora permite atualizar o cliente da obra!
}