import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { User, Building, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Empresa {
  id?: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
}

const PRIMARY = 'oklch(0.45 0.18 264)'

export function ConfiguracoesPage() {
  const { usuario } = useAuth()
  
  // Empresa states
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    async function carregarEmpresa() {
      try {
        setErro('')
        const res = await api.get('/empresa')
        if (res.data) {
          const emp = res.data
          setEmpresa(emp)
          setRazaoSocial(emp.razaoSocial || '')
          setNomeFantasia(emp.nomeFantasia || '')
          setCnpj(emp.cnpj || '')
          setTelefone(emp.telefone || '')
          setEmail(emp.email || '')
          setEndereco(emp.endereco || '')
          setCidade(emp.cidade || '')
          setEstado(emp.estado || '')
          setCep(emp.cep || '')
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error(err)
          setErro('Erro ao carregar os dados cadastrais da empresa.')
        }
      } finally {
        setCarregando(false)
      }
    }

    carregarEmpresa()
  }, [])

  const handleSalvarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setSalvando(true)

    const payload = {
      razaoSocial,
      nomeFantasia,
      cnpj,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      cep
    }

    try {
      if (empresa) {
        await api.put('/empresa', payload)
        setSucesso('Cadastro da empresa atualizado com sucesso!')
      } else {
        const res = await api.post('/empresa', payload)
        setEmpresa(res.data)
        setSucesso('Empresa cadastrada com sucesso!')
      }
    } catch (err: any) {
      console.error(err)
      setErro(err.response?.data?.message || 'Erro ao salvar dados da empresa.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
        <p className="text-sm font-semibold text-slate-500">Buscando configurações...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl p-4 md:p-6 mx-auto w-full">
      
      {/* Topo */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie seu perfil de acesso e dados corporativos</p>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <span>{sucesso}</span>
        </div>
      )}

      {/* Perfil do Usuário */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <User size={18} style={{ color: PRIMARY }} />
            <CardTitle className="text-base font-bold">Perfil de Acesso</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Nome do Usuário</span>
              <span className="font-semibold text-slate-900 block">{usuario?.nome}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">E-mail</span>
              <span className="font-semibold text-slate-900 block">{usuario?.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Nível de Permissão</span>
              <Badge variant="outline" className="mt-0.5 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide text-[10px]">
                {usuario?.perfil}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Empresa */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <Building size={18} style={{ color: PRIMARY }} />
            <CardTitle className="text-base font-bold">Dados da Construtora / Empresa</CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            Estas informações serão utilizadas na emissão de orçamentos e relatórios em PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSalvarEmpresa} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Razão Social</Label>
                <Input
                  required
                  placeholder="Ex: Construtora Rocha LTDA"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Nome Fantasia</Label>
                <Input
                  placeholder="Ex: Construtora Rocha"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">CNPJ / CPF</Label>
                <Input
                  required
                  placeholder="Ex: 00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Telefone de Contato</Label>
                <Input
                  placeholder="Ex: (11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">E-mail Comercial</Label>
                <Input
                  type="email"
                  placeholder="Ex: comercial@rocha.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">CEP</Label>
                <Input
                  placeholder="Ex: 01311-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Endereço Comercial</Label>
              <Input
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Cidade</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Estado (UF)</Label>
                <Input
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto h-12 rounded-xl font-semibold text-base gap-2"
                style={{ background: PRIMARY, color: 'white' }}
              >
                <Save size={18} />
                {salvando ? 'Salvando...' : 'Salvar Dados Cadastrais'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}