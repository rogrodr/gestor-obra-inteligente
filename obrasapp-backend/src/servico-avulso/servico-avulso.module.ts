import { Module } from '@nestjs/common';
import { ServicoAvulsoService } from './servico-avulso.service';
import { ServicoAvulsoController } from './servico-avulso.controller';

@Module({
  controllers: [ServicoAvulsoController],
  providers: [ServicoAvulsoService],
  exports: [ServicoAvulsoService],
})
export class ServicoAvulsoModule {}