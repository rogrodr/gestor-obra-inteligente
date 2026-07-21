import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  Building2, Plus, Calendar, MapPin, User, ChevronRight, 
  Trash2, Edit, AlertCircle, DollarSign, Download 
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

interface Obra {
  id: string
  nome: string
  endereco?: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ORCAMENTO' | 'PAUSADA'
  etapaAtual: 'FUNDACAO' | 'ALVENARIA' | 'REBOCO' | 'ACABAMENTO' | 'CONCLUIDA'
  dataInicio: string
  dataFim?: string
  clienteId: string
  cliente: {
    id: string
    nome: string
  }
}

interface Cliente {
  id: string
  nome: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  
  // Modais e Estados do Form
  const [modalAberto, setModalAberto] = useState(false)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [modalResumoAberto, setModalResumoAberto] = useState(false)
  
  // Form fields
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [status, setStatus] = useState<'EM_ANDAMENTO' | 'CONCLUIDA' | 'ORCAMENTO' | 'PAUSADA'>('EM_ANDAMENTO')
  const [etapa, setEtapa] = useState<'FUNDACAO' | 'ALVENARIA' | 'REBOCO' | 'ACABAMENTO' | 'CONCLUIDA'>('FUNDACAO')
  
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)
  const [resumoObra, setResumoObra] = useState<any | null>(null)
  const [carregandoResumo, setCarregandoResumo] = useState(false)
  const [baixandoRelatorio, setBaixandoRelatorio] = useState(false)

  const carregarObras = useCallback(async () => {
    try {
      setErro('')
      const [resObras, resClientes] = await Promise.all([
        api.get('/obras'),
        api.get('/clientes')
      ])
      setObras(resObras.data)
      setClientes(resClientes.data)
      if (resClientes.data.length > 0) {
        setClienteId(resClientes.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar dados de obras ou clientes.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarObras()

    const handleUpdate = () => carregarObras()
    window.addEventListener('etapa-atualizada', handleUpdate)
    window.addEventListener('lancamento-adicionado', handleUpdate)

    return () => {
      window.removeEventListener('etapa-atualizada', handleUpdate)
      window.removeEventListener('lancamento-adicionado', handleUpdate)
    }
  }, [carregarObras])

  const handleCriarObra = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId) {
      alert('É necessário ter um cliente cadastrado para criar uma obra!')
      return
    }

    try {
      await api.post('/obras', {
        nome,
        endereco,
        clienteId,
        status,
        etapaAtual: etapa
      })
      setModalAberto(false)
      setNome('')
      setEndereco('')
      carregarObras()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar obra')
    }
  }

  const handleAbrirEdicao = (obra: Obra) => {
    setObraSelecionada(obra)
    setNome(obra.nome)
    setEndereco(obra.endereco || '')
    setClienteId(obra.clienteId)
    setStatus(obra.status)
    setEtapa(obra.etapaAtual)
    setModalEdicaoAberto(true)
  }

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraSelecionada) return

    try {
      await api.put(`/obras/${obraSelecionada.id}`, {
        nome,
        endereco,
        clienteId,
        status,
        etapaAtual: etapa
      })
      setModalEdicaoAberto(false)
      setObraSelecionada(null)
      carregarObras()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar alteração')
    }
  }

  const handleExcluirObra = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta obra? Todos os lançamentos vinculados serão apagados.')) {
      try {
        await api.delete(`/obras/${id}`)
        carregarObras()
      } catch (err) {
        alert('Erro ao excluir obra')
      }
    }
  }

  const handleVerResumo = async (obra: Obra) => {
    setObraSelecionada(obra)
    setModalResumoAberto(true)
    setCarregandoResumo(true)
    try {
      const res = await api.get(`/obras/${obra.id}/resumo`)
      setResumoObra(res.data)
    } catch (err) {
      console.error(err)
      alert('Erro ao buscar resumo financeiro da obra')
    } finally {
      setCarregandoResumo(false)
    }
  }

  // NOVA FUNÇÃO: Integração com o Backend de PDFs
  const handleBaixarRelatorio = async () => {
    if (!obraSelecionada) return
    setBaixandoRelatorio(true)
    try {
      const response = await api.get(`/relatorios/obra/${obraSelecionada.id}`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-obra-${obraSelecionada.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar relatório em PDF da obra.')
    } finally {
      setBaixandoRelatorio(false)
    }
  }

  const getEtapaLabel = (e: string) => {
    const etapasMap: Record<string, string> = {
      FUNDACAO: 'Fundação 🏗️',
      ALVENARIA: 'Alvenaria 🧱',
      REBOCO: 'Reboco 🪚',
      ACABAMENTO: 'Acabamento 🎨',
      CONCLUIDA: 'Concluída ✅'
    }
    return etapasMap[e] || e
  }

  const formatarData = (d: string) => {
    return new Date(d).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Buscando obras...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie o progresso e finanças das obras ativas</p>
        </div>
        <Button
          onClick={() => {
            if (clientes.length === 0) {
              alert('Por favor, cadastre pelo menos um cliente antes de cadastrar uma obra!')
              return
            }
            setModalAberto(true)
          }}
          className="gap-2 rounded-xl h-10"
          style={{ background: PRIMARY, color: 'white' }}
        >
          <Plus size={16} />
          Nova Obra
        </Button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {obras.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm mt-6">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <Building2 size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">Nenhuma obra encontrada</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Clique no botão acima para cadastrar a primeira obra do seu canteiro.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Lista de Obras */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obras.map((obra) => (
            <Card key={obra.id} className="rounded-2xl border-slate-200 shadow-sm flex flex-col justify-between h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{obra.nome}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <User size={12} />
                        <span>Cliente: {obra.cliente?.nome || 'Não definido'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                      obra.status === 'EM_ANDAMENTO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      obra.status === 'CONCLUIDA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      obra.status === 'PAUSADA' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {obra.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {obra.endereco && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate" title={obra.endereco}>{obra.endereco}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                    <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                    <span>Início: {formatarData(obra.dataInicio)}</span>
                  </div>

                  {/* Linha de progresso de Etapa */}
                  <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                      <span className="uppercase tracking-wider">Etapa box:</span>
                      <span className="uppercase font-bold" style={{ color: PRIMARY }}>{getEtapaLabel(obra.etapaAtual)}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${obra.etapaAtual === 'CONCLUIDA' ? 'bg-emerald-500' : ''}`}
                        style={{
                          backgroundColor: obra.etapaAtual === 'CONCLUIDA' ? undefined : PRIMARY,
                          width: obra.etapaAtual === 'FUNDACAO' ? '20%' : 
                                 obra.etapaAtual === 'ALVENARIA' ? '40%' : 
                                 obra.etapaAtual === 'REBOCO' ? '60%' : 
                                 obra.etapaAtual === 'ACABAMENTO' ? '80%' : '100%' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleVerResumo(obra)}
                    className="flex items-center gap-1 text-xs font-semibold h-8 px-2 hover:bg-slate-100"
                    style={{ color: PRIMARY }}
                  >
                    <DollarSign size={14} />
                    Resumo Financeiro
                    <ChevronRight size={14} />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAbrirEdicao(obra)}
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      title="Editar Obra"
                    >
                      <Edit size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluirObra(obra.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir Obra"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Criar Obra */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nova Obra</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCriarObra} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Nome da Obra</Label>
              <Input
                type="text"
                required
                placeholder="Ex: Reforma Casa de Campo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Endereço</Label>
              <Input
                type="text"
                placeholder="Rua, Número, Bairro, Cidade"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Cliente Vinculado</Label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Status Inicial</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="PAUSADA">Pausada</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Etapa Inicial</Label>
                <select
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value as any)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="FUNDACAO">Fundação</option>
                  <option value="ALVENARIA">Alvenaria</option>
                  <option value="REBOCO">Reboco</option>
                  <option value="ACABAMENTO">Acabamento</option>
                </select>
              </div>
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl text-base font-semibold" style={{ background: PRIMARY, color: 'white' }}>
                Cadastrar Obra
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Editar Obra */}
      <Dialog open={modalEdicaoAberto} onOpenChange={setModalEdicaoAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Alterar Dados da Obra</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvarEdicao} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Nome da Obra</Label>
              <Input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Endereço</Label>
              <Input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Cliente Vinculado</Label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDA">Concluída</option>
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="PAUSADA">Pausada</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Etapa Atual</Label>
                <select
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value as any)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="FUNDACAO">Fundação</option>
                  <option value="ALVENARIA">Alvenaria</option>
                  <option value="REBOCO">Reboco</option>
                  <option value="ACABAMENTO">Acabamento</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl text-base font-semibold" style={{ background: PRIMARY, color: 'white' }}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Resumo Financeiro da Obra */}
      <Dialog open={modalResumoAberto} onOpenChange={setModalResumoAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <DialogTitle className="text-lg">Resumo Financeiro</DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{obraSelecionada?.nome}</p>
            </div>
          </div>
          
          {carregandoResumo ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
              <span className="text-xs text-slate-400">Calculando saldo da obra...</span>
            </div>
          ) : resumoObra ? (
            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Entradas</span>
                  <h3 className="text-lg font-bold text-emerald-700 mt-1">{formatarMoeda(resumoObra.financeiro.totalEntradas)}</h3>
                </div>
                
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                  <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Saídas</span>
                  <h3 className="text-lg font-bold text-red-700 mt-1">{formatarMoeda(resumoObra.financeiro.totalSaidas)}</h3>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo da Obra</span>
                  <h2 className={`text-xl font-bold mt-1 ${resumoObra.financeiro.saldo >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {formatarMoeda(resumoObra.financeiro.saldo)}
                  </h2>
                </div>
                <div className={`p-2 rounded-lg ${resumoObra.financeiro.saldo >= 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                  <DollarSign size={20} />
                </div>
              </div>

              {/* Botão de emitir relatório em PDF */}
              <Button
                onClick={handleBaixarRelatorio}
                disabled={baixandoRelatorio}
                className="w-full mt-2 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm disabled:opacity-50"
                style={{ background: PRIMARY, color: 'white' }}
              >
                <Download size={18} />
                {baixandoRelatorio ? 'Gerando Relatório PDF...' : 'Gerar Relatório em PDF'}
              </Button>

              <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed text-justify">
                * As saídas incluem pagamentos a fornecedores de materiais registrados, locações concluídas, diárias registradas nas presenças de equipe e pagamentos de serviços avulsos (empreiteiras).
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 italic text-sm">
              Não foi possível obter os dados da obra.
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}