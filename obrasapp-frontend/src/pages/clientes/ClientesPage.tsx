import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { Users, Plus, Phone, MapPin, Edit, Trash2, AlertCircle } from 'lucide-react'
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

interface Cliente {
  id: string
  nome: string
  telefone?: string
  endereco?: string
  createdAt: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtro, setFiltro] = useState('')

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEdicao, setClienteEdicao] = useState<Cliente | null>(null)

  // Form fields
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')

  const carregarClientes = useCallback(async () => {
    try {
      setErro('')
      const res = await api.get('/clientes')
      setClientes(res.data)
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar clientes do servidor.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarClientes()
  }, [carregarClientes])

  const handleAbrirCriar = () => {
    setClienteEdicao(null)
    setNome('')
    setTelefone('')
    setEndereco('')
    setModalAberto(true)
  }

  const handleAbrirEditar = (cliente: Cliente) => {
    setClienteEdicao(cliente)
    setNome(cliente.nome)
    setTelefone(cliente.telefone || '')
    setEndereco(cliente.endereco || '')
    setModalAberto(true)
  }

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (clienteEdicao) {
        await api.put(`/clientes/${clienteEdicao.id}`, { nome, telefone, endereco })
      } else {
        await api.post('/clientes', { nome, telefone, endereco })
      }
      setModalAberto(false)
      carregarClientes()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar cliente')
    }
  }

  const handleExcluirCliente = async (id: string) => {
    if (confirm('Deseja mesmo remover este cliente? Obras vinculadas a ele poderão ficar órfãs.')) {
      try {
        await api.delete(`/clientes/${id}`)
        carregarClientes()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir cliente')
      }
    }
  }

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    (c.telefone && c.telefone.includes(filtro))
  )

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Buscando clientes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Lista de clientes vinculados aos orçamentos e obras</p>
        </div>
        <Button onClick={handleAbrirCriar} className="gap-2 rounded-xl h-10" style={{ background: PRIMARY, color: 'white' }}>
          <Plus size={16} />
          Novo Cliente
        </Button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Barra de Filtro */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <Input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Pesquisar por nome ou telefone..."
            className="w-full h-12 rounded-xl text-base"
          />
        </CardContent>
      </Card>

      {/* Grid de Clientes ou Tabela */}
      {clientesFiltrados.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <Users size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">Nenhum cliente cadastrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {filtro ? 'Experimente buscar por outro nome.' : 'Cadastre um cliente clicando no botão acima.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-600 uppercase text-xs">Nome</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs">Contato</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-xs">Endereço</TableHead>
                <TableHead className="text-right font-bold text-slate-600 uppercase text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-slate-50/50 transition-all">
                  <TableCell className="font-semibold text-slate-900 py-4">
                    {cliente.nome}
                  </TableCell>
                  <TableCell className="text-slate-600 py-4">
                    {cliente.telefone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        {cliente.telefone}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Não cadastrado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 py-4 max-w-[200px] truncate" title={cliente.endereco}>
                    {cliente.endereco ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{cliente.endereco}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Não cadastrado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAbrirEditar(cliente)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluirCliente(cliente.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* MODAL: Criar / Editar Cliente */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{clienteEdicao ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvarCliente} className="flex flex-col gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">Nome Completo</Label>
              <Input
                required
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Telefone</Label>
              <Input
                placeholder="Ex: (11) 98765-4321"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Endereço Residencial</Label>
              <Input
                placeholder="Ex: Av. Paulista, 1000 - Apto 22"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <DialogFooter className="sm:justify-end mt-4">
              <Button type="submit" className="w-full sm:w-auto rounded-xl h-12 text-base font-semibold" style={{ background: PRIMARY, color: 'white' }}>
                {clienteEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}