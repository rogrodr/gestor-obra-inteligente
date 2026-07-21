import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { StatusMaterial } from '@prisma/client';

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
  "intencao": "LANCAMENTO" | "PRESENCA" | "ETAPA" | "ORCAMENTO" | "MATERIAL" | "CONSULTA" | "ADIANTAMENTO" | "SERVICO_AVULSO" | "LOCACAO" | "DESCONHECIDO",
  "dados": {
    "descricao": "string",
    "valor": number,
    "tipo": "ENTRADA" | "SAIDA",
    "categoria": "Materiais" | "Equipamentos" | "Transporte" | "Alimentacao" | "Outros",
    "nomes": ["string"],
    "diasTrabalhados": number,
    "valorDia": number,
    "etapa": "FUNDACAO" | "ALVENARIA" | "REBOCO" | "ACABAMENTO" | "CONCLUIDA",
    "titulo": "string",
    "itens": [{ "descricao": "string", "quantidade": number, "valorUnitario": number }],
    "materiais": ["string"],
    "periodo": "HOJE" | "SEMANA" | "MES" | "TODOS",
    "pergunta": "string",
    "diasPrevistos": number,
    "locador": "string",
    "equipamento": "string"
  },
  "confianca": number,
  "mensagemResposta": "string"
}

Regras:
- Se o usuário quiser ADICIONAR itens, insumos, ferramentas ou produtos a uma lista de compras ou lista de materiais (ex: "coloca cimento, areia e brita na lista", "adiciona um rolo de fio na lista de materiais") = MATERIAL
- Se mencionar receber dinheiro, pagamento de cliente = ENTRADA (intencao: LANCAMENTO)
- Se mencionar gastar, comprar na hora, pagar material já comprado = SAIDA (intencao: LANCAMENTO)
- Se mencionar trabalharam, trabalhou, dias = PRESENCA
- Se mencionar etapa, fase, começar, terminar fundação/alvenaria/reboco/acabamento = ETAPA
- Se mencionar orçamento, preciso fazer, quanto vai custar = ORCAMENTO
- Se o usuário ESTIVER PERGUNTANDO algo sobre a obra em vez de pedir para registrar algo novo (ex: "quanto eu já gastei?", "qual o saldo dessa obra?", "como está a obra?", "quanto recebi esse mês?", "em que etapa estamos?") = CONSULTA. Para CONSULTA, extraia o período mencionado em "periodo" (padrão "MES" se não disser nada) e copie a pergunta original do usuário em "pergunta".
- Se mencionar vale, adiantamento, adiantei, dei dinheiro antes pro trabalhador = ADIANTAMENTO. Extraia "nomes" com o nome do trabalhador e "valor".
- Se mencionar peão avulso, diarista sem cadastro, alguém que trabalhou sem ser da equipe fixa, paguei um serviço por fora = SERVICO_AVULSO. Extraia "descricao", "diasTrabalhados" e "valorDia".
- Se mencionar aluguel, locação, aluguei, locou, betoneira, andaime, equipamento alugado = LOCACAO. Extraia "equipamento", "valor", "diasPrevistos" (prazo em dias) e "locador" (nome do fornecedor se mencionado).
- Valores em reais, extraia apenas o número. Certifique-se de que quantidade e valorUnitario sejam números puros no JSON, nunca strings.
- Para MATERIAL: Identifique TODOS os itens que o usuário quer comprar e separe-os em itens individuais dentro do array "materiais". Inclua a quantidade junto com a descrição se dita (Exemplo: se disser "50 sacos de cimento e 2 metros de areia", o array deve ser ["50 sacos de cimento", "2 metros de areia"]).
- Para ORCAMENTO: Extraia o "titulo" (ex: Reforma da Garagem). Se houver um detalhamento do serviço, coloque em "descricao". Identifique TODOS os itens listados e quebre estritamente em um array contendo "descricao", "quantidade" e "valorUnitario".
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

      case 'MATERIAL':
        return this.executarMaterial(processado.dados, obraId);

      case 'CONSULTA':
        return this.executarConsulta(processado.dados, obraId);

      case 'ADIANTAMENTO':
        return this.executarAdiantamento(processado.dados, obraId);

      case 'SERVICO_AVULSO':
        return this.executarServicoAvulso(processado.dados, obraId);

      case 'LOCACAO':
        return this.executarLocacao(processado.dados, obraId);

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

    const itensComTotal = dados.itens?.map((item: any) => {
      const qtd = Number(item.quantidade) || 1;
      const valorUnit = Number(item.valorUnitario) || 0;
      return {
        descricao: item.descricao,
        quantidade: qtd,
        valorUnitario: valorUnit,
        total: qtd * valorUnit,
      };
    }) ?? [];

    const valorEstimado = itensComTotal.reduce((acc: number, item: any) => acc + item.total, 0);

    const orcamento = await this.prisma.orcamento.create({
      data: {
        titulo: dados.titulo || 'Orçamento via Assistente',
        descricao: dados.descricao || undefined,
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
      mensagem: `✅ Orçamento "${orcamento.titulo}" criado com valor estimado de R$ ${valorEstimado}`,
      dados: orcamento,
    };
  }

  private async executarMaterial(dados: any, obraId: string) {
    if (dados.materiais && dados.materiais.length > 0) {
      const listaMateriais = dados.materiais.map((itemTexto: string) => ({
        descricao: itemTexto.trim(),
        status: StatusMaterial.PENDENTE,
        obraId,
      }));

      await this.prisma.material.createMany({
        data: listaMateriais,
      });

      return {
        sucesso: true,
        intencao: 'MATERIAL',
        mensagem: `🛒 ${listaMateriais.length} itens adicionados à lista de compras com sucesso!`,
        dados: listaMateriais,
      };
    }

    const materialUnico = await this.prisma.material.create({
      data: {
        descricao: dados.descricao,
        status: StatusMaterial.PENDENTE,
        obraId,
      },
    });

    return {
      sucesso: true,
      intencao: 'MATERIAL',
      mensagem: `🛒 Adicionado à lista de compras: "${dados.descricao}"`,
      dados: materialUnico,
    };
  }

  private async executarAdiantamento(dados: any, obraId: string) {
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

      const adiantamento = await this.prisma.adiantamento.create({
        data: {
          trabalhadorId: trabalhador.id,
          obraId,
          valor: Number(dados.valor) || 0,
          descricao: dados.descricao ?? `Vale para ${trabalhador.nome}`,
        },
      });

      resultados.push({ nome, adiantamento });
    }

    return {
      sucesso: true,
      intencao: 'ADIANTAMENTO',
      mensagem: `💰 Adiantamento de R$ ${dados.valor} registrado para: ${dados.nomes.join(', ')}`,
      dados: resultados,
    };
  }

  private async executarServicoAvulso(dados: any, obraId: string) {
    const diasTrabalhados = Number(dados.diasTrabalhados) || 1;
    const valorPorDia = Number(dados.valorDia) || Number(dados.valor) || 0;
    const total = diasTrabalhados * valorPorDia;

    const servico = await this.prisma.servicoAvulso.create({
      data: {
        descricao: dados.descricao,
        diasTrabalhados,
        valorPorDia,
        total,
        obraId,
      },
    });

    return {
      sucesso: true,
      intencao: 'SERVICO_AVULSO',
      mensagem: `👷 Serviço avulso registrado: ${dados.descricao} — R$ ${total.toFixed(2)}`,
      dados: servico,
    };
  }

  private async executarLocacao(dados: any, obraId: string) {
    const dataInicio = new Date();
    const diasPrevistos = Number(dados.diasPrevistos) || 1;
    const dataFimPrevista = new Date(
      dataInicio.getTime() + diasPrevistos * 24 * 60 * 60 * 1000,
    );

    const locacao = await this.prisma.locacao.create({
      data: {
        equipamento: dados.equipamento ?? dados.descricao,
        valor: Number(dados.valor) || 0,
        dataInicio,
        dataFimPrevista,
        status: 'ATIVO',
        locador: dados.locador ?? null,
        obraId,
      },
    });

    return {
      sucesso: true,
      intencao: 'LOCACAO',
      mensagem: `🔧 Locação de "${locacao.equipamento}" registrada — R$ ${locacao.valor} — devolução prevista em ${diasPrevistos} dia(s)`,
      dados: locacao,
    };
  }

  private async executarConsulta(dados: any, obraId: string) {
    const obra = await this.prisma.obra.findUnique({
      where: { id: obraId },
      include: {
        lancamentos: true,
        servicosAvulsos: true,
        presencas: { include: { trabalhador: true } },
        adiantamentos: { include: { trabalhador: true } },
        cliente: { select: { nome: true } },
      },
    });

    if (!obra) throw new BadRequestException('Obra não encontrada');

    const agora = new Date();
    let dataLimite = new Date(0);

    if (dados.periodo === 'HOJE') {
      dataLimite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    } else if (dados.periodo === 'SEMANA') {
      dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dados.periodo === 'MES') {
      dataLimite = new Date(agora.getFullYear(), agora.getMonth(), 1);
    }

    const lancamentosFiltrados = obra.lancamentos.filter(
      (l) => new Date(l.createdAt) >= dataLimite,
    );
    const servicosFiltrados = obra.servicosAvulsos.filter(
      (s) => new Date(s.createdAt) >= dataLimite,
    );
    const presencasFiltradas = obra.presencas.filter(
      (p) => new Date(p.data) >= dataLimite,
    );
    const adiantamentosFiltrados = obra.adiantamentos.filter(
      (a) => new Date(a.data) >= dataLimite,
    );

    const entradas = lancamentosFiltrados
      .filter((l) => l.tipo === 'ENTRADA')
      .reduce((acc, l) => acc + l.valor, 0);

    const saidas = lancamentosFiltrados
      .filter((l) => l.tipo === 'SAIDA')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalServicosAvulsos = servicosFiltrados.reduce((acc, s) => acc + s.total, 0);
    const totalPresencas = presencasFiltradas.reduce((acc, p) => acc + p.total, 0);
    const totalAdiantamentos = adiantamentosFiltrados.reduce((acc, a) => acc + a.valor, 0);

    const saldo = entradas - saidas - totalServicosAvulsos - totalPresencas - totalAdiantamentos;

    const trabalhadoresNoPeriodo = [
      ...new Set(presencasFiltradas.map((p) => p.trabalhador.nome)),
    ];

    const contexto = `
Dados reais da obra "${obra.nome}" (cliente: ${obra.cliente?.nome ?? 'não informado'}):
- Período analisado: ${dados.periodo ?? 'MES'}
- Total de entradas: R$ ${entradas.toFixed(2)}
- Total de saídas/materiais: R$ ${saidas.toFixed(2)}
- Total com serviços avulsos: R$ ${totalServicosAvulsos.toFixed(2)}
- Total com presenças de equipe: R$ ${totalPresencas.toFixed(2)}
- Total de adiantamentos pagos: R$ ${totalAdiantamentos.toFixed(2)}
- Saldo do período: R$ ${saldo.toFixed(2)}
- Etapa atual da obra: ${obra.etapaAtual}
- Status da obra: ${obra.status}
- Trabalhadores que registraram presença no período: ${trabalhadoresNoPeriodo.join(', ') || 'nenhum'}
`;

    const model = this.gemini.getGenerativeModel({ model: 'gemini-flash-latest' });
    const respostaIa = await model.generateContent(`
Você é um assistente de obras conversando com um pedreiro brasileiro. Com base SOMENTE nos dados
reais abaixo, responda a pergunta do usuário de forma natural, curta e direta, em português
brasileiro informal, como numa resposta de áudio de WhatsApp. Use os valores exatos fornecidos,
nunca invente números que não estão no contexto. Se a pergunta não puder ser respondida com os
dados disponíveis, diga isso de forma simpática.

${contexto}

Pergunta do usuário: "${dados.pergunta ?? dados.descricao}"
`);

    const mensagemFinal = respostaIa.response.text().trim();

    return {
      sucesso: true,
      intencao: 'CONSULTA',
      mensagem: mensagemFinal,
      dados: {
        periodo: dados.periodo ?? 'MES',
        entradas,
        saidas,
        totalServicosAvulsos,
        totalPresencas,
        totalAdiantamentos,
        saldo,
        etapaAtual: obra.etapaAtual,
        status: obra.status,
      },
    };
  }
}