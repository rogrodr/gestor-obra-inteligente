import { Module } from '@nestjs/common';
import { DiariosObraService } from './diarios-obra.service';
import { DiariosObraController } from './diarios-obra.controller';

@Module({
  controllers: [DiariosObraController],
  providers: [DiariosObraService],
  exports: [DiariosObraService],
})
export class DiariosObraModule {}