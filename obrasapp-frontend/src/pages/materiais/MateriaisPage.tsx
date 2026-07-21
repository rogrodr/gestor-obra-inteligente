import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/api'
import { 
  ShoppingCart, Plus, Trash2, AlertCircle, CheckSquare, Square
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Material {
  id: string
  descricao: string
  status: 'PENDENTE' | 'COMPRADO' | 'CANCELADO'
  obraId: string
  createdAt: string
}

interface Obra {
  id: string
  nome: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [selectedObraId, setSelectedObraId] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Form Field
  const [descricao, setDescricao] = useState('')
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
      setErro('Erro ao carregar lista de obras.')
      setCarregando(false)
    }
  }, [])

  const carregarMateriais = useCallback(async () => {
    if (!selectedObraId) return

    setCarregando(true)

    try {
      setErro('')

      const res = await api.get(
        `/materiais/obra/${selectedObraId}`
      )

      const materiaisRecebidos = Array.isArray(
        res.data?.materiais
      )
        ? res.data.materiais
        : []

      setMateriais(materiaisRecebidos)
    } catch (err) {
      console.error(err)

      setErro(
        'Erro ao buscar lista de materiais da obra selecionada.'
      )

      setMateriais([])
    } finally {
      setCarregando(false)
    }
  }, [selectedObraId])

  useEffect(() => {
    carregarObras()
  }, [carregarObras])

  useEffect(() => {
    if (selectedObraId) {
      carregarMateriais()
    }
  }, [selectedObraId, carregarMateriais])

  // Ouvir atualização por voz
  useEffect(() => {
    const handleVoiceUpdate = () => {
      carregarMateriais()
    }
    window.addEventListener('material-adicionado', handleVoiceUpdate)
    window.addEventListener('offline-sync-done', handleVoiceUpdate)

    return () => {
      window.removeEventListener('material-adicionado', handleVoiceUpdate)
      window.removeEventListener('offline-sync-done', handleVoiceUpdate)
    }
  }, [carregarMateriais])

  const handleCriarMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descricao.trim() || !selectedObraId) return

    setAdicionando(true)
    try {
      await api.post('/materiais', {
        descricao,
        status: 'PENDENTE',
        obraId: selectedObraId
      })
      setDescricao('')
      carregarMateriais()
    } catch (err) {
      alert('Erro ao adicionar material à lista.')
    } finally {
      setAdicionando(false)
    }
  }

  const handleToggleComprado = async (id: string, statusAtual: string) => {
    try {
      if (statusAtual === 'COMPRADO') {
        // Se já está comprado, volta para PENDENTE
        await api.put(`/materiais/${id}`, { status: 'PENDENTE' })
      } else {
        // Se está pendente ou cancelado, marca como comprado
        await api.patch(`/materiais/${id}/comprado`)
      }
      carregarMateriais()
    } catch (err) {
      alert('Erro ao alterar status do material.')
    }
  }

  const handleChangeStatus = async (id: string, novoStatus: 'PENDENTE' | 'COMPRADO' | 'CANCELADO') => {
    try {
      await api.put(`/materiais/${id}`, { status: novoStatus })
      carregarMateriais()
    } catch (err) {
      alert('Erro ao atualizar status do material.')
    }
  }

  const handleExcluirMaterial = async (id: string) => {
    if (confirm('Deseja remover este material da lista?')) {
      try {
        await api.delete(`/materiais/${id}`)
        carregarMateriais()
      } catch (err) {
        alert('Erro ao excluir material da lista.')
      }
    }
  }

  if (obras.length === 0 && !carregando) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm max-w-7xl mx-auto w-full mt-6">
        <CardContent className="p-12 text-center flex flex-col items-center justify-center">
          <ShoppingCart size={48} className="text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">Nenhuma obra cadastrada</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Por favor, crie uma obra na aba Obras antes de acessar a lista de compras de materiais.
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
          <h1 className="text-2xl font-bold text-slate-900">Lista de Compras e Checklist</h1>
          <p className="text-sm text-slate-500 mt-0.5">Materiais pendentes, comprados ou cancelados no canteiro</p>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Seletor de Obra e Adição de Item */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Seletor de Obra (4 cols) */}
        <Card className="md:col-span-4 rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-2 justify-center h-full">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visualizar Obra:</Label>
            <select
              value={selectedObraId}
              onChange={(e) => setSelectedObraId(e.target.value)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              {obras.map(o => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Adicionar Material (8 cols) */}
        <Card className="md:col-span-8 rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-4 h-full">
            <form onSubmit={handleCriarMaterial} className="flex flex-col gap-2 justify-center h-full">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adicionar Novo Material:</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: 50 sacos de areia grossa"
                  required
                  className="flex-1 h-12 rounded-xl text-base"
                />
                <Button
                  type="submit"
                  disabled={adicionando || !descricao.trim()}
                  className="h-12 px-6 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                  style={{ background: PRIMARY, color: 'white' }}
                >
                  <Plus size={16} />
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Lista de Materiais Checklist */}
      {carregando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
          <span className="text-xs text-slate-400">Carregando materiais...</span>
        </div>
      ) : materiais.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <ShoppingCart size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Checklist vazio para esta obra</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Nenhum material pendente de compra. Escreva acima ou use o assistente de voz na página inicial para incluir itens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              {Array.isArray(materiais) &&
                materiais.map((mat) => (
                <div 
                  key={mat.id} 
                  className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                    mat.status === 'COMPRADO' 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : mat.status === 'CANCELADO'
                      ? 'bg-slate-50/50 border-slate-200 opacity-60 line-through'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  
                  {/* Checkbox de Marcação Rápida */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleComprado(mat.id, mat.status)}
                      className={`p-1 rounded-lg transition-all ${
                        mat.status === 'COMPRADO' 
                          ? 'text-emerald-600 hover:text-emerald-800' 
                          : 'text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      {mat.status === 'COMPRADO' ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <span className={`text-sm font-semibold truncate ${
                      mat.status === 'COMPRADO' ? 'text-emerald-900' : 'text-slate-900'
                    }`}>
                      {mat.descricao}
                    </span>
                  </div>

                  {/* Controles de Status Completo */}
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(mat.id, 'PENDENTE')}
                        className={`text-[10px] font-bold px-2 h-7 rounded-lg uppercase ${
                          mat.status === 'PENDENTE' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Pendente
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(mat.id, 'COMPRADO')}
                        className={`text-[10px] font-bold px-2 h-7 rounded-lg uppercase ${
                          mat.status === 'COMPRADO' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Comprado
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(mat.id, 'CANCELADO')}
                        className={`text-[10px] font-bold px-2 h-7 rounded-lg uppercase ${
                          mat.status === 'CANCELADO' 
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Cancelar
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluirMaterial(mat.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir item"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2 font-medium">
              <span>Legenda: Comprado arquiva ou conclui o item na lista financeira da obra.</span>
              <div className="flex gap-4">
                <span>🟢 Comprado: {Array.isArray(materiais) ? materiais.filter(m => m.status === 'COMPRADO').length : 0}</span>
                <span>🟡 Pendente: {Array.isArray(materiais) ? materiais.filter(m => m.status === 'PENDENTE').length : 0}</span>
                <span>⚪ Cancelado: {Array.isArray(materiais) ? materiais.filter(m => m.status === 'CANCELADO').length : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}