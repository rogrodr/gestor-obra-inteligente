import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IaService {
  private gemini: GoogleGenerativeAI;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.gemini = new GoogleGenerativeAI(
      this.config.get<string>('GEMINI_API_KEY') as string,
    );
  }

  async processarComando(texto: string, obraId: string) {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
Você é um assistente de gestão de obras para um pedreiro brasileiro.
Analise o texto abaixo e identifique a intenção e extraia os dados necessários.

Texto: "${texto}"

Responda APENAS com um JSON válido, sem markdown, sem explicações, seguindo esse formato:

{
  "intencao": "LANCAMENTO" | "PRESENCA" | "ETAPA" | "ORCAMENTO" | "DESCONHECIDO",
  "dados": {
    "descricao": "string",
    "valor": number,
    "tipo": "ENTRADA" | "SAIDA",
    "categoria": "Materiais" | "Ferramentas" | "Transporte" | "Alimentacao" | "Outros",
    "nomes": ["string"],
    "diasTrabalhados": number,
    "valorDia": number,
    "etapa": "FUNDACAO" | "ALVENARIA" | "REBOCO" | "ACABAMENTO" | "CONCLUIDA",
    "titulo": "string",
    "itens": [{ "descricao": "string", "quantidade": number, "valorUnitario": number }]
  },
  "confianca": number,
  "mensagemResposta": "string"
}

Regras:
- Se mencionar receber dinheiro, pagamento de cliente = ENTRADA
- Se mencionar gastar, comprar, pagar material = SAIDA
- Se mencionar trabalharam, trabalhou, dias = PRESENCA
- Se mencionar etapa, fase, começar, terminar fundação/alvenaria/reboco/acabamento = ETAPA
- Se mencionar orçamento, preciso fazer, quanto vai custar = ORCAMENTO
- Valores em reais, extraia apenas o número
- Se não entender = DESCONHECIDO
`;

    try {
      const resultado = await model.generateContent(prompt);
      const textoResposta = resultado.response.text();

      console.log('RESPOSTA GEMINI:', textoResposta);

      const textoLimpo = textoResposta
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      console.log('TEXTO LIMPO:', textoLimpo);

      const json = JSON.parse(textoLimpo);
      return json;
    } catch (erro) {
      console.error('Erro ao processar IA:', erro);
      throw new BadRequestException('Não foi possível processar o comando de voz');
    }
  }

  async executarComando(texto: string, obraId: string, usuarioId: string) {
    const processado = await this.processarComando(texto, obraId);

    if (processado.confianca < 0.5) {
      return {
        sucesso: false,
        mensagem: 'Não entendi bem o comando. Pode repetir de forma mais clara?',
        processado,
      };
    }

    switch (processado.intencao) {
      case 'LANCAMENTO':
        return this.executarLancamento(processado.dados, obraId);

      case 'PRESENCA':
        return this.executarPresenca(processado.dados, obraId);

      case 'ETAPA':
        return this.executarEtapa(processado.dados, obraId);

      case 'ORCAMENTO':
        return this.executarOrcamento(processado.dados, obraId, usuarioId);

      default:
        return {
          sucesso: false,
          mensagem: processado.mensagemResposta,
          processado,
        };
    }
  }

  private async executarLancamento(dados: any, obraId: string) {
    const lancamento = await this.prisma.lancamento.create({
      data: {
        descricao: dados.descricao,
        valor: dados.valor,
        tipo: dados.tipo,
        categoria: dados.categoria,
        origem: 'VOZ',
        obraId,
      },
    });

    return {
      sucesso: true,
      intencao: 'LANCAMENTO',
      mensagem: `✅ ${dados.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} de R$ ${dados.valor} registrada: ${dados.descricao}`,
      dados: lancamento,
    };
  }

  private async executarPresenca(dados: any, obraId: string) {
    const resultados: any[] = [];

    for (const nome of dados.nomes) {
      const trabalhador = await this.prisma.trabalhador.findFirst({
        where: {
          nome: { contains: nome, mode: 'insensitive' },
          ativo: true,
        },
      });

      if (!trabalhador) {
        resultados.push({ nome, erro: `Trabalhador "${nome}" não encontrado no cadastro` });
        continue;
      }

      const valorDia = dados.valorDia ?? trabalhador.valorDia;
      const total = dados.diasTrabalhados * valorDia;

      const presenca = await this.prisma.presenca.create({
        data: {
          trabalhadorId: trabalhador.id,
          obraId,
          diasTrabalhados: dados.diasTrabalhados,
          valorDia,
          total,
        },
      });

      resultados.push({ nome, presenca });
    }

    return {
      sucesso: true,
      intencao: 'PRESENCA',
      mensagem: `✅ Presença registrada para: ${dados.nomes.join(', ')}`,
      dados: resultados,
    };
  }

  private async executarEtapa(dados: any, obraId: string) {
    const obra = await this.prisma.obra.update({
      where: { id: obraId },
      data: { etapaAtual: dados.etapa },
    });

    return {
      sucesso: true,
      intencao: 'ETAPA',
      mensagem: `✅ Etapa atualizada para: ${dados.etapa}`,
      dados: obra,
    };
  }

  private async executarOrcamento(dados: any, obraId: string, usuarioId: string) {
    const obra = await this.prisma.obra.findUnique({
      where: { id: obraId },
      select: { clienteId: true },
    });

    if (!obra) throw new BadRequestException('Obra não encontrada');

    const itensComTotal = dados.itens?.map((item: any) => ({
      ...item,
      total: item.quantidade * item.valorUnitario,
    })) ?? [];

    const valorEstimado = itensComTotal.reduce((acc: number, item: any) => acc + item.total, 0);

    const orcamento = await this.prisma.orcamento.create({
      data: {
        titulo: dados.titulo,
        valorEstimado,
        clienteId: obra.clienteId,
        usuarioId,
        itens: { create: itensComTotal },
      },
      include: { itens: true, cliente: true },
    });

    return {
      sucesso: true,
      intencao: 'ORCAMENTO',
      mensagem: `✅ Orçamento "${dados.titulo}" criado com valor estimado de R$ ${valorEstimado}`,
      dados: orcamento,
    };
  }
}