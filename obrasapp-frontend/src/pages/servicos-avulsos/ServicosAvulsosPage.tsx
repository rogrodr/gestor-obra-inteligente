import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  Wrench, Plus, Trash2, AlertCircle, Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface Obra {
  id: string
  nome: string
}

interface ServicoAvulso {
  id: string
  descricao: string
  diasTrabalhados: number
  valorPorDia: number
  total: number
  createdAt: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function ServicosAvulsosPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [servicos, setServicos] = useState<ServicoAvulso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  
  const [obraFiltroId, setObraFiltroId] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

  // Form Fields
  const [obraId, setObraId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [diasTrabalhados, setDiasTrabalhados] = useState<number>(1)
  const [valorPorDia, setValorPorDia] = useState<number>(150)

  const carregarObras = useCallback(async () => {
    try {
      setErro('')
      const res = await api.get('/obras')
      setObras(res.data)
      
      if (res.data.length > 0) {
        setObraFiltroId(res.data[0].id)
        setObraId(res.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar lista de obras.')
    } finally {
      setCarregando(false)
    }
  }, [])

  const carregarServicos = useCallback(async () => {
    if (!obraFiltroId) return
    try {
      const res = await api.get(`/servicos-avulsos/obra/${obraFiltroId}`)
      setServicos(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [obraFiltroId])

  useEffect(() => {
    carregarObras()
  }, [carregarObras])

  useEffect(() => {
    carregarServicos()
  }, [carregarServicos])

  const handleAbrirModal = () => {
    setDescricao('')
    setDiasTrabalhados(1)
    setValorPorDia(150)
    if (obras.length > 0) setObraId(obras[0].id)
    setModalAberto(true)
  }

  const handleSalvarServico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId) {
      alert('Selecione uma obra.')
      return
    }

    try {
      await api.post('/servicos-avulsos', {
        descricao,
        diasTrabalhados: Number(diasTrabalhados),
        valorPorDia: Number(valorPorDia),
        obraId
      })
      setModalAberto(false)
      carregarServicos()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar serviço avulso')
    }
  }

  const handleExcluirServico = async (id: string) => {
    if (confirm('Tem certeza de que deseja remover este serviço avulso? O valor será removido das despesas da obra.')) {
      try {
        await api.delete(`/servicos-avulsos/${id}`)
        carregarServicos()
      } catch (err) {
        alert('Erro ao excluir serviço.')
      }
    }
  }

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR')
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Carregando serviços...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Serviços Avulsos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Controle de empreiteiros, terceirizados e diárias avulsas</p>
        </div>
        <Button
          onClick={handleAbrirModal}
          disabled={obras.length === 0}
          className="gap-2 rounded-xl h-10 w-full sm:w-auto"
          style={{ background: PRIMARY, color: 'white' }}
        >
          <Plus size={16} />
          Lançar Serviço
        </Button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Filtro de Obra */}
      {obras.length > 0 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Obra Atual:</Label>
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

      {/* Tabela de Serviços */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Descrição do Serviço</TableHead>
              <TableHead className="font-bold">Data</TableHead>
              <TableHead className="font-bold text-center">Dias Trabs.</TableHead>
              <TableHead className="font-bold text-right">Valor/Dia</TableHead>
              <TableHead className="font-bold text-right">Custo Total</TableHead>
              <TableHead className="font-bold text-right w-[60px]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Wrench size={32} className="mb-2 opacity-50" />
                    <p className="italic text-sm">Nenhum serviço avulso lançado para esta obra.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              servicos.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-slate-900">
                    {s.descricao}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatarData(s.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-slate-700">
                    {s.diasTrabalhados}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {formatarMoeda(s.valorPorDia)}
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-rose-600">
                    {formatarMoeda(s.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluirServico(s.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir Serviço"
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

      {/* MODAL: Lançar Serviço */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Lançar Serviço Avulso</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSalvarServico} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Obra de Destino</Label>
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

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Descrição do Serviço</Label>
              <Input
                type="text"
                required
                placeholder="Ex: Instalação Elétrica - Empresa ABC"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Dias Trabalhados</Label>
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
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Valor por Dia (R$)</Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={valorPorDia}
                  onChange={(e) => setValorPorDia(Number(e.target.value))}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="mt-2 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Custo Total:</span>
              <span className="font-black text-rose-700 text-xl">
                {formatarMoeda((diasTrabalhados || 0) * (valorPorDia || 0))}
              </span>
            </div>

            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base" style={{ background: PRIMARY, color: 'white' }}>
                Salvar Serviço
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}