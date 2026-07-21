import { Module } from '@nestjs/common';
import { LocacoesService } from './locacoes.service';
import { LocacoesController } from './locacoes.controller';

@Module({
  controllers: [LocacoesController],
  providers: [LocacoesService],
  exports: [LocacoesService],
})
export class LocacoesModule {}