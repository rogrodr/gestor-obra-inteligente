import { Module } from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';
import { LancamentosController } from './lancamentos.controller';

@Module({
  controllers: [LancamentosController],
  providers: [LancamentosService],
  exports: [LancamentosService],
})
export class LancamentosModule {}