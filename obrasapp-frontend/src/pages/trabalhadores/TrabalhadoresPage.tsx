import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  Briefcase, Plus, Calendar, CircleDollarSign, 
  AlertCircle, Trash2, Edit2 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Trabalhador {
  id: string
  nome: string
  funcao: string
  valorDia: number
  ativo: boolean
  tipoContrato?: string
}

interface Obra {
  id: string
  nome: string
}

interface Presenca {
  id: string
  data: string
  diasTrabalhados: number
  valorDia: number
  total: number
  observacao?: string
  trabalhador: {
    nome: string
    funcao: string
    tipoContrato?: string
  }
}

interface Adiantamento {
  id: string
  data: string
  valor: number
  descricao?: string
  trabalhador: {
    nome: string
  }
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function TrabalhadoresPage() {
  const [trabalhadores, setTrabalhadores] = useState<Trabalhador[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [adiantamentos, setAdiantamentos] = useState<Adiantamento[]>([])
  
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'equipe' | 'presencas' | 'adiantamentos'>('equipe')

  // Filtros
  const [obraFiltroId, setObraFiltroId] = useState('')

  // Modais
  const [modalTrabalhadorAberto, setModalTrabalhadorAberto] = useState(false)
  const [modalPresencaAberto, setModalPresencaAberto] = useState(false)
  const [modalAdiantamentoAberto, setModalAdiantamentoAberto] = useState(false)

  // Form Trabalhador (Criar e Editar)
  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [valorDia, setValorDia] = useState<number>(120)
  const [tipoContrato, setTipoContrato] = useState<string>('DIARISTA')

  // Form Presença / Lançamento de Valor
  const [trabalhadorId, setTrabalhadorId] = useState('')
  const [obraId, setObraId] = useState('')
  const [diasTrabalhados, setDiasTrabalhados] = useState<number>(1)
  const [valorDiaPresenca, setValorDiaPresenca] = useState<number>(120)
  const [observacao, setObservacao] = useState('')

  // Form Adiantamento
  const [trabalhadorAdiantamentoId, setTrabalhadorAdiantamentoId] = useState('')
  const [obraAdiantamentoId, setObraAdiantamentoId] = useState('')
  const [valorAdiantamento, setValorAdiantamento] = useState<number>(50)
  const [descricaoAdiantamento, setDescricaoAdiantamento] = useState('')

  // Helper para identificar o tipo do trabalhador selecionado no form de presença
  const trabalhadorSelecionadoNoForm = trabalhadores.find(t => t.id === trabalhadorId)
  const esEmpreiteiroNoForm = trabalhadorSelecionadoNoForm?.tipoContrato === 'EMPREITEIRO'

  const carregarDadosIniciais = useCallback(async () => {
    try {
      setErro('')
      const [resTrab, resObras] = await Promise.all([
        api.get('/trabalhadores'),
        api.get('/obras')
      ])
      
      const trabajadoresAtivos = resTrab.data || []
      const listaObras = resObras.data || []

      setTrabalhadores(trabajadoresAtivos)
      setObras(listaObras)
      
      if (listaObras.length > 0) {
        setObraFiltroId(listaObras[0].id)
        setObraId(listaObras[0].id)
        setObraAdiantamentoId(listaObras[0].id)
      }

      const ativos = trabajadoresAtivos.filter((t: Trabalhador) => t.ativo)
      if (ativos.length > 0) {
        setTrabalhadorId(ativos[0].id)
        setTrabalhadorAdiantamentoId(ativos[0].id)
        setValorDiaPresenca(ativos[0].valorDia)
      }
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar dados iniciais.')
    } finally {
      setCarregando(false)
    }
  }, [])

  const carregarPresencas = useCallback(async () => {
    if (!obraFiltroId) return
    try {
      const res = await api.get(`/trabalhadores/presenca/obra/${obraFiltroId}`)
      setPresencas(res.data.presencas || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }, [obraFiltroId])

  const carregarAdiantamentos = useCallback(async () => {
    if (!obraFiltroId) return
    try {
      const res = await api.get(`/adiantamentos?obraId=${obraFiltroId}`)
      setAdiantamentos(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }, [obraFiltroId])

  useEffect(() => {
    carregarDadosIniciais()
  }, [carregarDadosIniciais])

  useEffect(() => {
    if (abaAtiva === 'presencas') {
      carregarPresencas()
    } else if (abaAtiva === 'adiantamentos') {
      carregarAdiantamentos()
    }
  }, [abaAtiva, obraFiltroId, carregarPresencas, carregarAdiantamentos])

  useEffect(() => {
    const handleSyncUpdate = () => {
      carregarDadosIniciais()
      carregarPresencas()
      carregarAdiantamentos()
    }
    window.addEventListener('presenca-adicionada', handleSyncUpdate)
    window.addEventListener('offline-sync-done', handleSyncUpdate)

    return () => {
      window.removeEventListener('presenca-adicionada', handleSyncUpdate)
      window.removeEventListener('offline-sync-done', handleSyncUpdate)
    }
  }, [carregarDadosIniciais, carregarPresencas, carregarAdiantamentos])

  const fecharModalTrabalhador = () => {
    setModalTrabalhadorAberto(false)
    setIdEditando(null)
    setNome('')
    setFuncao('')
    setValorDia(120)
    setTipoContrato('DIARISTA')
  }

  const abrirModalEditar = (t: Trabalhador) => {
    setIdEditando(t.id)
    setNome(t.nome)
    setFuncao(t.funcao)
    setValorDia(t.valorDia)
    setTipoContrato(t.tipoContrato || 'DIARISTA')
    setModalTrabalhadorAberto(true)
  }

  const handleSalvarTrabalhador = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        nome,
        funcao,
        valorDia: Number(valorDia),
        tipoContrato
      }

      if (idEditando) {
        await api.patch(`/trabalhadores/${idEditando}`, payload)
      } else {
        await api.post('/trabalhadores', payload)
      }

      fecharModalTrabalhador()
      carregarDadosIniciais()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar trabalhador')
    }
  }

  const handleDesativarTrabalhador = async (id: string) => {
    if (confirm('Tem certeza que deseja alterar o status de atividade deste trabalhador?')) {
      try {
        await api.patch(`/trabalhadores/${id}/desativar`)
        carregarDadosIniciais()
      } catch (err) {
        alert('Erro ao alterar atividade do trabalhador')
      }
    }
  }

  const handleLancarPresenca = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/trabalhadores/presenca', {
        trabalhadorId,
        obraId,
        diasTrabalhados: Number(diasTrabalhados),
        valorDia: Number(valorDiaPresenca),
        observacao: observacao.trim() || undefined
      })
      setModalPresencaAberto(false)
      setObservacao('')
      setDiasTrabalhados(1)
      if (abaAtiva === 'presencas') carregarPresencas()
      else setAbaAtiva('presencas')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar lançamento')
    }
  }

  const handleLancarAdiantamento = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/adiantamentos', {
        trabalhadorId: trabalhadorAdiantamentoId,
        obraId: obraAdiantamentoId,
        valor: Number(valorAdiantamento),
        descricao: descricaoAdiantamento.trim() || undefined
      })
      setModalAdiantamentoAberto(false)
      setDescricaoAdiantamento('')
      setValorAdiantamento(50)
      if (abaAtiva === 'adiantamentos') carregarAdiantamentos()
      else setAbaAtiva('adiantamentos')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar adiantamento')
    }
  }

  const handleExcluirPresenca = async (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      try {
        await api.delete(`/trabalhadores/presenca/${id}`)
        carregarPresencas()
      } catch (err) {
        alert('Erro ao remover registro')
      }
    }
  }

  const handleExcluirAdiantamento = async (id: string) => {
    if (confirm('Deseja excluir este adiantamento financeiro?')) {
      try {
        await api.delete(`/adiantamentos/${id}`)
        carregarAdiantamentos()
      } catch (err) {
        alert('Erro ao remover adiantamento')
      }
    }
  }

  const handleSelecionarTrabalhadorForm = (id: string) => {
    setTrabalhadorId(id)
    const t = trabalhadores.find(x => x.id === id)
    if (t) setValorDiaPresenca(t.valorDia)
  }

  const abrirModalPresencaComDados = () => {
    const ativos = trabalhadores.filter(t => t.ativo)
    if (ativos.length === 0 || obras.length === 0) {
      alert('É necessário ter trabalhadores ativos e obras para registrar lançamentos!')
      return
    }
    setTrabalhadorId(ativos[0].id)
    setValorDiaPresenca(ativos[0].valorDia)
    setModalPresencaAberto(true)
  }

  const abrirModalAdiantamentoComDados = () => {
    const ativos = trabalhadores.filter(t => t.ativo)
    if (ativos.length === 0 || obras.length === 0) {
      alert('É necessário ter trabalhadores ativos e obras para registrar adiantamentos!')
      return
    }
    setTrabalhadorAdiantamentoId(ativos[0].id)
    setModalAdiantamentoAberto(true)
  }

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Buscando equipe...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipe e Canteiro</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestão de pessoal, controle de pagamentos e adiantamentos</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setIdEditando(null)
              setModalTrabalhadorAberto(true)
            }}
            className="flex-1 sm:flex-none gap-1.5 rounded-xl h-10 border-slate-200"
          >
            <Plus size={16} />
            Novo Trabalhador
          </Button>
          <Button
            variant="outline"
            onClick={abrirModalPresencaComDados}
            className="flex-1 sm:flex-none gap-1.5 rounded-xl h-10 border-slate-200"
          >
            <Calendar size={16} />
            Lançar Presença
          </Button>
          <Button
            onClick={abrirModalAdiantamentoComDados}
            className="flex-1 sm:flex-none gap-1.5 rounded-xl h-10 w-full sm:w-auto mt-2 sm:mt-0"
            style={{ background: PRIMARY, color: 'white' }}
          >
            <CircleDollarSign size={16} />
            Adiantamento
          </Button>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setAbaAtiva('equipe')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            abaAtiva === 'equipe' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={abaAtiva === 'equipe' ? { borderColor: PRIMARY, color: PRIMARY } : undefined}
        >
          Integrantes da Equipe
        </button>
        <button
          onClick={() => setAbaAtiva('presencas')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            abaAtiva === 'presencas' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={abaAtiva === 'presencas' ? { borderColor: PRIMARY, color: PRIMARY } : undefined}
        >
          Registro de Presenças / Empreitas
        </button>
        <button
          onClick={() => setAbaAtiva('adiantamentos')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            abaAtiva === 'adiantamentos' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={abaAtiva === 'adiantamentos' ? { borderColor: PRIMARY, color: PRIMARY } : undefined}
        >
          Vales / Adiantamentos
        </button>
      </div>

      {/* Filtro de Obra */}
      {abaAtiva !== 'equipe' && obras.length > 0 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Filtrar por Obra:</Label>
              <select
                value={obraFiltroId}
                onChange={(e) => setObraFiltroId(e.target.value)}
                className="flex h-12 w-full sm:w-64 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTEÚDO DA ABA: EQUIPE */}
      {abaAtiva === 'equipe' && (
        <div>
          {trabalhadores.length === 0 ? (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                <Briefcase size={48} className="text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-900 text-lg">Nenhum trabalhador cadastrado</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  Cadastre seus diaristas e empreiteiros para controlar o fluxo de caixa do canteiro.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trabalhadores.map((t) => (
                <Card key={t.id} className="rounded-2xl border-slate-200 shadow-sm flex flex-col justify-between h-full">
                  <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{t.nome}</h3>
                          <div className="flex flex-wrap gap-2 items-center mt-1">
                            <span className="text-xs text-slate-500 font-medium">{t.funcao}</span>
                            {t.tipoContrato && (
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                                {t.tipoContrato}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider shrink-0 ${
                          t.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {t.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>

                      {/* 🔄 RÓTULO DINÂMICO NO CARD */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">
                          {t.tipoContrato === 'EMPREITEIRO' ? 'Valor do Contrato:' : 'Valor da Diária:'}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{formatarMoeda(t.valorDia)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-1">
                      <Button
                        variant="ghost"
                        onClick={() => abrirModalEditar(t)}
                        className="flex items-center gap-1.5 text-xs font-bold h-8 px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={14} /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDesativarTrabalhador(t.id)}
                        className={`text-xs font-bold h-8 px-3 rounded-lg ${
                          t.ativo 
                            ? 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700' 
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {t.ativo ? 'Desativar' : 'Reativar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA: PRESENÇAS / MEDIÇÕES */}
      {abaAtiva === 'presencas' && (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Trabalhador</TableHead>
                <TableHead className="font-bold">Data</TableHead>
                <TableHead className="font-bold text-center">Qtd / Dias</TableHead>
                <TableHead className="font-bold text-right">Valor Unitário</TableHead>
                <TableHead className="font-bold text-right">Total</TableHead>
                <TableHead className="font-bold text-right w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presencas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                    Nenhum lançamento registrado para esta obra.
                  </TableCell>
                </TableRow>
              ) : (
                presencas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-bold text-slate-900">{p.trabalhador?.nome}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.trabalhador?.funcao}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(p.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-slate-700">
                      {p.diasTrabalhados}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatarMoeda(p.valorDia)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatarMoeda(p.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluirPresenca(p.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CONTEÚDO DA ABA: ADIANTAMENTOS */}
      {abaAtiva === 'adiantamentos' && (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Trabalhador</TableHead>
                <TableHead className="font-bold">Data</TableHead>
                <TableHead className="font-bold">Descrição/Observação</TableHead>
                <TableHead className="font-bold text-right">Valor do Vale</TableHead>
                <TableHead className="font-bold text-right w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adiantamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                    Nenhum vale/adiantamento registrado para esta obra.
                  </TableCell>
                </TableRow>
              ) : (
                adiantamentos.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-bold text-slate-900">
                      {a.trabalhador?.nome}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(a.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-[200px] truncate">
                      {a.descricao || <span className="text-xs text-slate-400 italic">Adiantamento geral</span>}
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-red-600">
                      {formatarMoeda(a.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluirAdiantamento(a.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* MODAL: Criar / Editar Trabalhador */}
      <Dialog open={modalTrabalhadorAberto} onOpenChange={(open) => !open && fecharModalTrabalhador()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{idEditando ? 'Editar Trabalhador' : 'Novo Trabalhador'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSalvarTrabalhador} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Nome Completo</Label>
              <Input
                type="text"
                required
                placeholder="Ex: Carlos Alberto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Função / Cargo</Label>
              <Input
                type="text"
                required
                placeholder="Ex: Pedreiro, Servente, Pintor"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Tipo de Contrato</Label>
                <select
                  value={tipoContrato}
                  onChange={(e) => setTipoContrato(e.target.value)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="DIARISTA">Diarista</option>
                  <option value="EMPREITEIRO">Empreiteiro</option>
                </select>
              </div>

              {/* 🔄 RÓTULO DINÂMICO BASEADO NO CONTRATO SELECIONADO */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">
                  {tipoContrato === 'EMPREITEIRO' ? 'Valor Contrato (R$)' : 'Valor da Diária (R$)'}
                </Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={valorDia}
                  onChange={(e) => setValorDia(Number(e.target.value))}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base" style={{ background: PRIMARY, color: 'white' }}>
                {idEditando ? 'Salvar Alterações' : 'Cadastrar Integrante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Lançar Frequência / Parcela de Empreita */}
      <Dialog open={modalPresencaAberto} onOpenChange={setModalPresencaAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {esEmpreiteiroNoForm ? 'Lançar Pagamento de Empreita' : 'Registrar Frequência'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLancarPresenca} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Selecionar Trabalhador</Label>
              <select
                value={trabalhadorId}
                onChange={(e) => handleSelecionarTrabalhadorForm(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {trabalhadores.filter(t => t.ativo).map(t => (
                  <option key={t.id} value={t.id}>{t.nome} ({t.funcao} - {t.tipoContrato})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Obra Vinculada</Label>
              <select
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>

            {/* 🔄 INPUTS DINÂMICOS NO LANÇAMENTO DE PRESENÇA/PAGAMENTO */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">
                  {esEmpreiteiroNoForm ? 'Multiplicador / Qtd' : 'Dias Trabalhados'}
                </Label>
                <Input
                  type="number"
                  required
                  min={0.5}
                  step={0.5}
                  value={diasTrabalhados}
                  onChange={(e) => setDiasTrabalhados(Number(e.target.value))}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">
                  {esEmpreiteiroNoForm ? 'Valor Parcela (R$)' : 'Valor do Dia (R$)'}
                </Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={valorDiaPresenca}
                  onChange={(e) => setValorDiaPresenca(Number(e.target.value))}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Observação</Label>
              <Input
                type="text"
                placeholder={esEmpreiteiroNoForm ? "Ex: Pagamento referente à fundação" : "Ex: Trabalhou meio período ou hora extra"}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base" style={{ background: PRIMARY, color: 'white' }}>
                {esEmpreiteiroNoForm ? 'Confirmar Lançamento' : 'Lançar Frequência'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Lançar Adiantamento / Vale */}
      <Dialog open={modalAdiantamentoAberto} onOpenChange={setModalAdiantamentoAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Vale (Adiantamento)</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLancarAdiantamento} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Trabalhador</Label>
              <select
                value={trabalhadorAdiantamentoId}
                onChange={(e) => setTrabalhadorAdiantamentoId(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {trabalhadores.filter(t => t.ativo).map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Obra Relacionada</Label>
              <select
                value={obraAdiantamentoId}
                onChange={(e) => setObraAdiantamentoId(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Valor do Vale (R$)</Label>
              <Input
                type="number"
                required
                min={1}
                value={valorAdiantamento}
                onChange={(e) => setValorAdiantamento(Number(e.target.value))}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Descrição / Observação</Label>
              <Input
                type="text"
                placeholder="Ex: Adiantamento para o final de semana"
                value={descricaoAdiantamento}
                onChange={(e) => setDescricaoAdiantamento(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base" style={{ background: PRIMARY, color: 'white' }}>
                Lançar Adiantamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}