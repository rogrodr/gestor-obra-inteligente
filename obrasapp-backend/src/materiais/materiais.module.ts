import { Module } from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { MateriaisController } from './materiais.controller';

@Module({
  controllers: [MateriaisController],
  providers: [MateriaisService],
  exports: [MateriaisService],
})
export class MateriaisModule {}