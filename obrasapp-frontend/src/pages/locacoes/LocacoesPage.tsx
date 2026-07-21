import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  Wrench, Plus, AlertCircle, Trash2, 
  CheckCircle2, Store 
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

interface Locacao {
  id: string
  equipamento: string
  valor: number
  dataInicio: string
  dataFimPrevista: string
  dataDevolucao?: string
  status: string // 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO'
  locador?: string
  obraId: string
}

interface Obra {
  id: string
  nome: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function LocacoesPage() {
  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [selectedObraId, setSelectedObraId] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Modais
  const [modalAberto, setModalAberto] = useState(false)

  // Form Fields
  const [equipamento, setEquipamento] = useState('')
  const [valor, setValor] = useState<number>(100)
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().substring(0, 10))
  const [dataFimPrevista, setDataFimPrevista] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10))
  const [locador, setLocador] = useState('')
  const [adicionando, setAdicionando] = useState(false)

  const carregarObras = useCallback(async () => {
    try {
      setErro('')
      const res = await api.get('/obras')
      setObras(res.data)
      if (res.data.length > 0) {
        setSelectedObraId(res.data[0].id)
      } else {
        setCarregando(false)
      }
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar obras.')
      setCarregando(false)
    }
  }, [])

  const carregarLocacoes = useCallback(async () => {
    if (!selectedObraId) return
    setCarregando(true)
    try {
      setErro('')
      const res = await api.get(`/locacoes?obraId=${selectedObraId}`)
      setLocacoes(res.data)
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar locações da obra.')
    } finally {
      setCarregando(false)
    }
  }, [selectedObraId])

  useEffect(() => {
    carregarObras()
  }, [carregarObras])

  useEffect(() => {
    if (selectedObraId) {
      carregarLocacoes()
    }
  }, [selectedObraId, carregarLocacoes])

  const handleCriarLocacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipamento.trim() || !selectedObraId) return

    setAdicionando(true)
    try {
      await api.post('/locacoes', {
        equipamento,
        valor,
        dataInicio: new Date(dataInicio).toISOString(),
        dataFimPrevista: new Date(dataFimPrevista).toISOString(),
        status: 'ATIVO',
        locador,
        obraId: selectedObraId
      })
      setEquipamento('')
      setLocador('')
      setModalAberto(false)
      carregarLocacoes()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar locação')
    } finally {
      setAdicionando(false)
    }
  }

  const handleDevolverEquipamento = async (id: string) => {
    if (confirm('Marcar este equipamento como devolvido?')) {
      try {
        await api.patch(`/locacoes/${id}`, {
          status: 'DEVOLVIDO',
          dataDevolucao: new Date().toISOString()
        })
        carregarLocacoes()
      } catch (err) {
        alert('Erro ao processar devolução.')
      }
    }
  }

  const handleExcluirLocacao = async (id: string) => {
    if (confirm('Deseja excluir permanentemente este registro de locação?')) {
      try {
        await api.delete(`/locacoes/${id}`)
        carregarLocacoes()
      } catch (err) {
        alert('Erro ao excluir registro de locação.')
      }
    }
  }

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatarData = (d: string) => {
    return new Date(d).toLocaleDateString('pt-BR')
  }

  if (obras.length === 0 && !carregando) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm max-w-7xl mx-auto w-full mt-6">
        <CardContent className="p-12 text-center flex flex-col items-center justify-center">
          <Wrench size={48} className="text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">Nenhuma obra cadastrada</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Por favor, crie uma obra na aba Obras antes de acessar o controle de locações.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locação de Equipamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Controle de ferramentas alugadas, custos e devoluções</p>
        </div>
        <Button onClick={() => setModalAberto(true)} className="gap-2 rounded-xl h-10" style={{ background: PRIMARY, color: 'white' }}>
          <Plus size={16} />
          Nova Locação
        </Button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Seletor de Obra */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Visualizar Obra:</span>
            <select
              value={selectedObraId}
              onChange={(e) => setSelectedObraId(e.target.value)}
              className="flex h-10 w-full sm:w-64 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              {obras.map(o => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela ou Grid de Locações */}
      {carregando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
          <span className="text-xs text-slate-400">Carregando locações...</span>
        </div>
      ) : locacoes.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <Wrench size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Nenhum equipamento alugado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Nenhuma locação ativa vinculada a esta obra. Clique no botão acima para adicionar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locacoes.map((loc) => {
            const isAtrasado = loc.status === 'ATIVO' && new Date(loc.dataFimPrevista).getTime() < Date.now()
            
            return (
              <Card 
                key={loc.id} 
                className={`rounded-2xl shadow-sm border-l-4 ${
                  loc.status === 'DEVOLVIDO' 
                    ? 'border-l-emerald-500 bg-emerald-50/10 border-slate-200' 
                    : isAtrasado
                    ? 'border-l-red-500 bg-red-50/10 border-slate-200'
                    : 'border-slate-200'
                }`}
                style={!loc.status.includes('DEVOLVIDO') && !isAtrasado ? { borderLeftColor: PRIMARY } : undefined}
              >
                <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">{loc.equipamento}</h2>
                        {loc.locador && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Store size={11} />
                            <span>Locador: {loc.locador}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                        loc.status === 'DEVOLVIDO' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isAtrasado
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {loc.status === 'DEVOLVIDO' ? 'Devolvido' : isAtrasado ? 'Atrasado ⚠️' : 'Ativo'}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 p-3 border border-slate-100 rounded-xl text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 font-semibold block">Valor Aluguel</span>
                        <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{formatarMoeda(loc.valor)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Datas</span>
                        <span className="block mt-0.5 text-[11px]">
                          Inicio: {formatarData(loc.dataInicio)} <br />
                          Prazo: {formatarData(loc.dataFimPrevista)}
                        </span>
                      </div>
                    </div>

                    {loc.dataDevolucao && (
                      <div className="text-[11px] text-emerald-700 font-medium mt-3 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Entregue de volta em: {formatarData(loc.dataDevolucao)}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    {loc.status === 'ATIVO' ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleDevolverEquipamento(loc.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                      >
                        <CheckCircle2 size={14} />
                        Confirmar Devolução
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-semibold px-2">Devolução concluída</span>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluirLocacao(loc.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODAL: Nova Locação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Locar Equipamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCriarLocacao} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Equipamento / Ferramenta</Label>
              <Input
                required
                placeholder="Ex: Betoneira 400L, Rompedor 15kg"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Locador (Empresa Rental)</Label>
              <Input
                placeholder="Ex: Rental Helper, Casa do Construtor"
                value={locador}
                onChange={(e) => setLocador(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Custo de Aluguel (R$)</Label>
              <Input
                type="number"
                required
                min={1}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Data Início</Label>
                <Input
                  type="date"
                  required
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Devolução Prevista</Label>
                <Input
                  type="date"
                  required
                  value={dataFimPrevista}
                  onChange={(e) => setDataFimPrevista(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button 
                type="submit" 
                disabled={adicionando}
                className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base"
                style={{ background: PRIMARY, color: 'white' }}
              >
                {adicionando ? 'Gravando...' : 'Registrar Locação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}