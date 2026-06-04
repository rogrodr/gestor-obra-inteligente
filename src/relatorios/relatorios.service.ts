import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  private async buscarEmpresa(usuarioId: string) {
    return this.prisma.empresa.findUnique({ where: { usuarioId } });
  }

  private adicionarCabecalho(doc: any, empresa: any, titulo: string) {
    // Cabeçalho com dados da empresa
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(empresa?.nomeFantasia ?? empresa?.razaoSocial ?? 'Empresa', { align: 'center' });

    if (empresa?.cnpj) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`CNPJ: ${empresa.cnpj}`, { align: 'center' });
    }

    if (empresa?.telefone) {
      doc.fontSize(10)
         .text(`Telefone: ${empresa.telefone}`, { align: 'center' });
    }

    if (empresa?.endereco) {
      doc.fontSize(10)
         .text(`${empresa.endereco} — ${empresa.cidade ?? ''} ${empresa.estado ?? ''}`, { align: 'center' });
    }

    doc.moveDown()
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(titulo, { align: 'center' });

    doc.moveDown()
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke()
       .moveDown();
  }

  private formatarMoeda(valor: number) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  private formatarData(data: Date) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // ─── RELATÓRIO DA OBRA ────────────────────────────────────────────────────
  async gerarRelatorioObra(obraId: string, usuarioId: string, res: Response) {
    const obra = await this.prisma.obra.findFirst({
      where: { id: obraId, usuarioId },
      include: {
        cliente: true,
        lancamentos: { orderBy: { createdAt: 'desc' } },
        maoDeObra: { orderBy: { createdAt: 'desc' } },
        presencas: {
          include: { trabalhador: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!obra) throw new NotFoundException('Obra não encontrada');

    const empresa = await this.buscarEmpresa(usuarioId);

    const entradas = obra.lancamentos
      .filter((l) => l.tipo === 'ENTRADA')
      .reduce((acc, l) => acc + l.valor, 0);

    const saidas = obra.lancamentos
      .filter((l) => l.tipo === 'SAIDA')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalMaoDeObra = obra.maoDeObra
      .reduce((acc, m) => acc + m.total, 0);

    const totalPresencas = obra.presencas
      .reduce((acc, p) => acc + p.total, 0);

    const saldo = entradas - saidas - totalMaoDeObra - totalPresencas;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-obra-${obraId}.pdf`);
    doc.pipe(res);

    this.adicionarCabecalho(doc, empresa, 'RELATÓRIO DE OBRA');

    // Dados da obra
    doc.fontSize(12).font('Helvetica-Bold').text('Dados da Obra');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
       .text(`Nome: ${obra.nome}`)
       .text(`Cliente: ${obra.cliente.nome}`)
       .text(`Telefone: ${obra.cliente.telefone ?? 'Não informado'}`)
       .text(`Endereço: ${obra.endereco ?? 'Não informado'}`)
       .text(`Status: ${obra.status.replace('_', ' ')}`)
       .text(`Etapa atual: ${obra.etapaAtual}`)
       .text(`Data de início: ${this.formatarData(obra.dataInicio)}`);

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Resumo financeiro
    doc.fontSize(12).font('Helvetica-Bold').text('Resumo Financeiro');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
       .text(`Total recebido: ${this.formatarMoeda(entradas)}`)
       .text(`Total gasto com materiais: ${this.formatarMoeda(saidas)}`)
       .text(`Total mão de obra avulsa: ${this.formatarMoeda(totalMaoDeObra)}`)
       .text(`Total mão de obra equipe: ${this.formatarMoeda(totalPresencas)}`);

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold')
       .text(`Saldo: ${this.formatarMoeda(saldo)}`);

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Histórico de lançamentos
    if (obra.lancamentos.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Histórico de Lançamentos');
      doc.moveDown(0.5);

      obra.lancamentos.forEach((l) => {
        doc.fontSize(9).font('Helvetica')
           .text(
             `${this.formatarData(l.createdAt)} — ${l.tipo} — ${l.descricao} — ${this.formatarMoeda(l.valor)} ${l.categoria ? `(${l.categoria})` : ''}`,
           );
      });

      doc.moveDown()
         .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
         .moveDown();
    }

    // Rodapé
    doc.fontSize(9).font('Helvetica')
       .text(`Gerado em: ${this.formatarData(new Date())}`, { align: 'right' });

    doc.end();
  }

  // ─── RELATÓRIO DO TRABALHADOR ─────────────────────────────────────────────
  async gerarRelatorioTrabalhador(
    trabalhadorId: string,
    usuarioId: string,
    res: Response,
  ) {
    const trabalhador = await this.prisma.trabalhador.findUnique({
      where: { id: trabalhadorId },
      include: {
        presencas: {
          include: { obra: { select: { id: true, nome: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!trabalhador) throw new NotFoundException('Trabalhador não encontrado');

    const empresa = await this.buscarEmpresa(usuarioId);
    const total = trabalhador.presencas.reduce((acc, p) => acc + p.total, 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pagamento-${trabalhadorId}.pdf`);
    doc.pipe(res);

    this.adicionarCabecalho(doc, empresa, 'RELATÓRIO DE PAGAMENTO');

    // Dados do trabalhador
    doc.fontSize(12).font('Helvetica-Bold').text('Dados do Trabalhador');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
       .text(`Nome: ${trabalhador.nome}`)
       .text(`Função: ${trabalhador.funcao}`)
       .text(`Tipo de contrato: ${trabalhador.tipoContrato}`)
       .text(`Valor da diária: ${this.formatarMoeda(trabalhador.valorDia)}`);

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Histórico de presenças
    doc.fontSize(12).font('Helvetica-Bold').text('Histórico de Trabalho');
    doc.moveDown(0.5);

    trabalhador.presencas.forEach((p) => {
      doc.fontSize(9).font('Helvetica')
         .text(
           `${this.formatarData(p.createdAt)} — ${p.obra.nome} — ${p.diasTrabalhados} dia(s) — ${this.formatarMoeda(p.valorDia)}/dia — Total: ${this.formatarMoeda(p.total)}${p.observacao ? ` — Obs: ${p.observacao}` : ''}`,
         );
    });

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Total
    doc.fontSize(14).font('Helvetica-Bold')
       .text(`Total a receber: ${this.formatarMoeda(total)}`, { align: 'right' });

    doc.moveDown(2);

    // Assinatura
    doc.fontSize(10).font('Helvetica')
       .text('_______________________________', { align: 'center' })
       .text(`${trabalhador.nome}`, { align: 'center' })
       .text('Assinatura', { align: 'center' });

    doc.moveDown();
    doc.fontSize(9).font('Helvetica')
       .text(`Gerado em: ${this.formatarData(new Date())}`, { align: 'right' });

    doc.end();
  }

  // ─── ORÇAMENTO PDF ────────────────────────────────────────────────────────
  async gerarOrcamentoPdf(orcamentoId: string, usuarioId: string, res: Response) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id: orcamentoId, usuarioId },
      include: {
        cliente: true,
        itens: true,
      },
    });

    if (!orcamento) throw new NotFoundException('Orçamento não encontrado');

    const empresa = await this.buscarEmpresa(usuarioId);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=orcamento-${orcamentoId}.pdf`);
    doc.pipe(res);

    this.adicionarCabecalho(doc, empresa, 'ORÇAMENTO DE SERVIÇOS');

    // Número e data
    doc.fontSize(10).font('Helvetica')
       .text(`Orçamento Nº: ${orcamento.id.slice(0, 8).toUpperCase()}`)
       .text(`Data: ${this.formatarData(orcamento.createdAt)}`)
       .text(`Validade: ${orcamento.validadeEmDias} dias`);

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Dados do cliente
    doc.fontSize(12).font('Helvetica-Bold').text('Cliente');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
       .text(`Nome: ${orcamento.cliente.nome}`)
       .text(`Telefone: ${orcamento.cliente.telefone ?? 'Não informado'}`)
       .text(`Endereço: ${orcamento.cliente.endereco ?? 'Não informado'}`);

    doc.moveDown()
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Descrição
    if (orcamento.descricao) {
      doc.fontSize(12).font('Helvetica-Bold').text('Descrição do Serviço');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(orcamento.descricao);
      doc.moveDown()
         .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
         .moveDown();
    }

    // Itens
    doc.fontSize(12).font('Helvetica-Bold').text('Itens do Orçamento');
    doc.moveDown(0.5);

    // Cabeçalho da tabela
    doc.fontSize(9).font('Helvetica-Bold')
       .text('Descrição', 50, doc.y, { width: 250 })
       .text('Qtd', 300, doc.y - doc.currentLineHeight(), { width: 60, align: 'center' })
       .text('Valor Unit.', 360, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' })
       .text('Total', 450, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' });

    doc.moveDown(0.5)
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown(0.3);

    // Itens da tabela
    orcamento.itens.forEach((item) => {
      const y = doc.y;
      doc.fontSize(9).font('Helvetica')
         .text(item.descricao, 50, y, { width: 250 })
         .text(item.quantidade.toString(), 300, y, { width: 60, align: 'center' })
         .text(this.formatarMoeda(item.valorUnitario), 360, y, { width: 90, align: 'right' })
         .text(this.formatarMoeda(item.total), 450, y, { width: 90, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown(0.3)
       .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
       .moveDown();

    // Total
    doc.fontSize(14).font('Helvetica-Bold')
       .text(`Total: ${this.formatarMoeda(orcamento.valorEstimado ?? 0)}`, { align: 'right' });

    doc.moveDown();

    // Condições de pagamento
    if (orcamento.condicoesPagamento) {
      doc.fontSize(10).font('Helvetica-Bold').text('Condições de Pagamento:');
      doc.fontSize(10).font('Helvetica').text(orcamento.condicoesPagamento);
      doc.moveDown();
    }

    // Observações
    if (orcamento.observacoes) {
      doc.fontSize(10).font('Helvetica-Bold').text('Observações:');
      doc.fontSize(10).font('Helvetica').text(orcamento.observacoes);
      doc.moveDown();
    }

    doc.moveDown(2);

    // Assinaturas
    doc.fontSize(10).font('Helvetica')
       .text('_______________________________          _______________________________', { align: 'center' })
       .text(`${empresa?.nomeFantasia ?? 'Prestador de Serviço'}                    ${orcamento.cliente.nome}`, { align: 'center' })
       .text('Prestador                                          Cliente', { align: 'center' });

    doc.moveDown();
    doc.fontSize(9).font('Helvetica')
       .text(`Gerado em: ${this.formatarData(new Date())}`, { align: 'right' });

    doc.end();
  }
}