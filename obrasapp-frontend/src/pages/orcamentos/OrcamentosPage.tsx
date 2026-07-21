import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  FileText, Plus, User, Trash2, Edit, AlertCircle 
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
import { Textarea } from '@/components/ui/textarea'

interface ItemOrcamento {
  id?: string
  descricao: string
  quantidade: number
  valorUnitario: number
}

interface Orcamento {
  id: string
  titulo: string
  descricao?: string
  valorEstimado?: number
  valorFinal?: number
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO'
  clienteId: string
  cliente: {
    id: string
    nome: string
  }
  itens?: ItemOrcamento[]
}

interface Cliente {
  id: string
  nome: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtro, setFiltro] = useState('')

  // Modais
  const [modalAberto, setModalAberto] = useState(false)
  const [orcamentoEdicao, setOrcamentoEdicao] = useState<Orcamento | null>(null)

  // Form fields
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [status, setStatus] = useState<'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO'>('PENDENTE')
  const [valorFinal, setValorFinal] = useState<number>(0)
  
  // Lista dinâmica de itens
  const [itens, setItens] = useState<ItemOrcamento[]>([])
  const [novoItemDesc, setNovoItemDesc] = useState('')
  const [novoItemQtd, setNovoItemQtd] = useState<number | string>(1)
  const [novoItemValor, setNovoItemValor] = useState<number | string>(10)

  const carregarDados = useCallback(async () => {
    try {
      setErro('')
      const [resOrc, resCli] = await Promise.all([
        api.get('/orcamentos'),
        api.get('/clientes')
      ])
      setOrcamentos(resOrc.data)
      setClientes(resCli.data)
      
      if (resCli.data.length > 0 && !clienteId) {
        setClienteId(String(resCli.data[0].id))
      }
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar orçamentos ou clientes.')
    } finally {
      setCarregando(false)
    }
  }, [clienteId])

  useEffect(() => {
    carregarDados()

    const handleUpdate = () => carregarDados()
    window.addEventListener('orcamento-adicionado', handleUpdate)
    window.addEventListener('offline-sync-done', handleUpdate)

    return () => {
      window.removeEventListener('orcamento-adicionado', handleUpdate)
      window.removeEventListener('offline-sync-done', handleUpdate)
    }
  }, [carregarDados])

  const handleAbrirCriar = () => {
    setOrcamentoEdicao(null)
    setTitulo('')
    setDescricao('')
    if (clientes.length > 0) {
      setClienteId(String(clientes[0].id))
    } else {
      setClienteId('')
    }
    setStatus('PENDENTE')
    setValorFinal(0)
    setItens([])
    setNovoItemDesc('')
    setNovoItemQtd(1)
    setNovoItemValor(10)
    setModalAberto(true)
  }

  const handleAbrirEditar = async (orc: Orcamento) => {
    setOrcamentoEdicao(orc)
    setTitulo(orc.titulo)
    setDescricao(orc.descricao || '')
    setClienteId(String(orc.clienteId))
    setStatus(orc.status)
    setValorFinal(orc.valorFinal || 0)
    setNovoItemDesc('')
    setNovoItemQtd(1)
    setNovoItemValor(10)
    
    try {
      const detail = await api.get(`/orcamentos/${orc.id}`)
      setItens(detail.data.itens || [])
    } catch (err) {
      console.error(err)
      setItens([])
    }
    
    setModalAberto(true)
  }

  const handleAdicionarItemLista = () => {
    if (!novoItemDesc.trim()) {
      alert('Por favor, informe a descrição do item antes de adicionar.')
      return
    }
    const qtd = Number(novoItemQtd)
    const valor = Number(novoItemValor)

    if (isNaN(qtd) || qtd <= 0) {
      alert('Insira uma quantidade válida.')
      return
    }
    if (isNaN(valor) || valor <= 0) {
      alert('Insira um valor unitário válido.')
      return
    }

    const item: ItemOrcamento = {
      descricao: novoItemDesc.trim(),
      quantidade: qtd,
      valorUnitario: valor
    }
    setItens([...itens, item])
    setNovoItemDesc('')
    setNovoItemQtd(1)
    setNovoItemValor(10)
  }

  const handleRemoverItemLista = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteId) {
      alert('Por favor, selecione um cliente para vincular ao orçamento.')
      return
    }

    // Força mapeamento limpo de objeto puro para o NestJS receber como Array de DTOs estruturados
    const itensFormatados = itens.map(it => ({
      descricao: String(it.descricao).trim(),
      quantidade: Number(it.quantidade),
      valorUnitario: Number(it.valorUnitario)
    }))

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() ? descricao.trim() : undefined,
      clienteId: String(clienteId).trim(),
      status: status,
      itens: itensFormatados,
      ...(orcamentoEdicao && status === 'APROVADO' ? { valorFinal: Number(valorFinal) || calcularTotalEstimado() } : {})
    }

    try {
      if (orcamentoEdicao) {
        await api.put(`/orcamentos/${orcamentoEdicao.id}`, payload)
      } else {
        await api.post('/orcamentos', payload)
      }
      setModalAberto(false)
      carregarDados()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar orçamento')
    }
  }

  const handleExcluirOrcamento = async (id: string) => {
    if (confirm('Deseja mesmo remover este orçamento?')) {
      try {
        await api.delete(`/orcamentos/${id}`)
        carregarDados()
      } catch (err) {
        alert('Erro ao excluir orçamento')
      }
    }
  }

  const calcularTotalEstimado = () => {
    return itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)
  }

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const orcamentosFiltrados = orcamentos.filter(o =>
    o.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    (o.cliente?.nome && o.cliente.nome.toLowerCase().includes(filtro.toLowerCase()))
  )

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Buscando orçamentos...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orçamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Estimativas de custo para aprovação do cliente</p>
        </div>
        <Button
          onClick={() => {
            if (clientes.length === 0) {
              alert('Por favor, cadastre pelo menos um cliente antes de gerar um orçamento!')
              return
            }
            handleAbrirCriar()
          }}
          className="gap-2 rounded-xl h-10"
          style={{ background: PRIMARY, color: 'white' }}
        >
          <Plus size={16} />
          Criar Orçamento
        </Button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Barra de Busca */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <Input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Pesquisar orçamento por título ou cliente..."
            className="w-full h-12 rounded-xl text-base"
          />
        </CardContent>
      </Card>

      {/* Grid de Orçamentos */}
      {orcamentosFiltrados.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <FileText size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">Nenhum orçamento encontrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {filtro ? 'Tente ajustar sua pesquisa.' : 'Crie sua primeira proposta clicando no botão acima.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orcamentosFiltrados.map((orc) => (
            <Card key={orc.id} className="rounded-2xl border-slate-200 shadow-sm flex flex-col justify-between h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{orc.titulo}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <User size={12} />
                        <span>Cliente: {orc.cliente?.nome || 'Desconhecido'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                      orc.status === 'APROVADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      orc.status === 'RECUSADO' ? 'bg-red-50 text-red-700 border-red-200' :
                      orc.status === 'EXPIRADO' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {orc.status}
                    </Badge>
                  </div>

                  {orc.descricao && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {orc.descricao}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Custo Estimado</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5">{formatarMoeda(orc.valorEstimado || 0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Valor Fechado</span>
                      <span className="font-extrabold text-sm mt-0.5" style={{ color: PRIMARY }}>
                        {orc.valorFinal ? formatarMoeda(orc.valorFinal) : <span className="text-slate-400 font-normal italic">Pendente</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAbrirEditar(orc)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    title="Editar/Adicionar Itens"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluirOrcamento(orc.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Criar / Editar Orçamento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50 rounded-t-2xl">
            <DialogTitle>{orcamentoEdicao ? 'Editar Orçamento' : 'Criar Orçamento'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSalvarOrcamento} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Título da Proposta</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Instalação Hidráulica e Reboco"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Cliente Vinculado</Label>
                  <select
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Descrição Geral (Escopo)</Label>
                <Textarea
                  placeholder="Detalhamento geral dos serviços incluídos no orçamento..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="rounded-xl resize-none text-base min-h-[80px]"
                />
              </div>

              {orcamentoEdicao && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Status da Proposta</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="APROVADO">Aprovado</option>
                      <option value="RECUSADO">Recusado</option>
                      <option value="EXPIRADO">Expirado</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Valor Fechado (Final) R$</Label>
                    <Input
                      type="number"
                      disabled={status !== 'APROVADO'}
                      value={valorFinal}
                      onChange={(e) => setValorFinal(Number(e.target.value))}
                      className="h-12 rounded-xl text-base disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Seção de Gerenciamento de Itens */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Itens do Orçamento</h3>
                
                {/* Form Adicionar Item */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Descrição do Item</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Cimento Portland CPII (Saco 50kg)"
                      value={novoItemDesc}
                      onChange={(e) => setNovoItemDesc(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="w-full md:w-24 space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Qtd</Label>
                    <Input
                      type="number"
                      value={novoItemQtd}
                      onChange={(e) => setNovoItemQtd(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <div className="w-full md:w-28 space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Valor Unit (R$)</Label>
                    <Input
                      type="number"
                      value={novoItemValor}
                      onChange={(e) => setNovoItemValor(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAdicionarItemLista}
                    className="h-10 rounded-lg text-xs font-bold w-full md:w-auto"
                    style={{ background: PRIMARY, color: 'white' }}
                  >
                    Adicionar
                  </Button>
                </div>

                {/* Lista de Itens */}
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold text-center">Quantidade</TableHead>
                        <TableHead className="font-bold text-right">Valor Unitário</TableHead>
                        <TableHead className="font-bold text-right">Total</TableHead>
                        <TableHead className="font-bold text-right w-[60px]">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-slate-400 italic">
                            Nenhum item adicionado ainda. Adicione acima.
                          </TableCell>
                        </TableRow>
                      ) : (
                        itens.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-slate-900">{item.descricao}</TableCell>
                            <TableCell className="text-center">{item.quantidade}</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.valorUnitario)}</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatarMoeda(item.quantidade * item.valorUnitario)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoverItemLista(idx)}
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Subtotal */}
                <div className="flex justify-end mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Estimado</span>
                    <span className="text-2xl font-black" style={{ color: PRIMARY }}>{formatarMoeda(calcularTotalEstimado())}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-slate-100 bg-white shrink-0 sm:justify-end">
              <Button type="submit" className="w-full sm:w-auto h-12 rounded-xl text-base font-semibold" style={{ background: PRIMARY, color: 'white' }}>
                {orcamentoEdicao ? 'Salvar Proposta' : 'Cadastrar Proposta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}