import { Module } from '@nestjs/common';
import { MaoDeObraService } from './mao-de-obra.service';
import { MaoDeObraController } from './mao-de-obra.controller';

@Module({
  controllers: [MaoDeObraController],
  providers: [MaoDeObraService],
  exports: [MaoDeObraService],
})
export class MaoDeObraModule {}