import { Module } from '@nestjs/common';
import { AdiantamentosService } from './adiantamentos.service';
import { AdiantamentosController } from './adiantamentos.controller';

@Module({
  controllers: [AdiantamentosController],
  providers: [AdiantamentosService],
  exports: [AdiantamentosService],
})
export class AdiantamentosModule {}