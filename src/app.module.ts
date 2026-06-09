import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { ObrasModule } from './obras/obras.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';
import { MaoDeObraModule } from './mao-de-obra/mao-de-obra.module';
import { IaModule } from './ia/ia.module';
import { TrabalhadoresModule } from './trabalhadores/trabalhadores.module';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { EmpresaModule } from './empresa/empresa.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { AdiantamentosController } from './adiantamentos/adiantamentos.controller';
import { DiariosObraModule } from './diarios-obra/diarios-obra.module';
import { LocacoesModule } from './locacoes/locacoes.module';
import { AdiantamentosModule } from './adiantamentos/adiantamentos.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { MateriaisModule } from './materiais/materiais.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AutenticacaoModule,
    UsuariosModule,
    ClientesModule,
    ObrasModule,
    LancamentosModule,
    MaoDeObraModule,
    IaModule,
    TrabalhadoresModule,
    OrcamentosModule,
    EmpresaModule,
    RelatoriosModule,
    DiariosObraModule,
    LocacoesModule,
    AdiantamentosModule,
    EquipamentosModule,
    MateriaisModule,
  ],
  controllers: [AdiantamentosController],
})
export class AppModule {}