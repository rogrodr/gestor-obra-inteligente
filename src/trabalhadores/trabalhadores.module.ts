import { Module } from '@nestjs/common';
import { TrabalhadoresService } from './trabalhadores.service';
import { TrabalhadoresController } from './trabalhadores.controller';

@Module({
  controllers: [TrabalhadoresController],
  providers: [TrabalhadoresService],
  exports: [TrabalhadoresService],
})
export class TrabalhadoresModule {}