import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setCarregando(true)

    try {
      await api.post('/autenticacao/registrar', { nome, email, senha })
      await login(email, senha)
      navigate('/')
    } catch (err: any) {
      const mensagem = err.response?.data?.message
      setErro(Array.isArray(mensagem) ? mensagem[0] : mensagem ?? 'Erro ao criar conta')
    } finally {
      setCarregando(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style={{ background: 'oklch(0.45 0.18 264)' }}>
              <Building2 className="text-white" size={28} strokeWidth={2.2} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Obras<span style={{ color: 'oklch(0.45 0.18 264)' }}>App</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Crie sua conta para começar
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold text-slate-900">Criar conta</h2>
              <p className="text-sm text-slate-500">Preencha seus dados para se cadastrar</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistro} className="flex flex-col gap-5 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-slate-700">Nome completo</Label>
                  <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="h-12 rounded-xl text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700">E-mail</Label>
                  <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="h-12 rounded-xl text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="senha" className="text-slate-700">Senha</Label>
                  <Input
                      id="senha"
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="h-12 rounded-xl text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmarSenha" className="text-slate-700">Confirmar senha</Label>
                  <Input
                      id="confirmarSenha"
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className="h-12 rounded-xl text-base"
                  />
                </div>

                {erro && (
                    <p className="text-sm text-center py-2.5 rounded-xl bg-red-50 text-red-600">
                      {erro}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={carregando}
                    className="w-full h-12 rounded-xl text-base font-semibold mt-1"
                    style={{ background: 'oklch(0.45 0.18 264)' }}
                >
                  {carregando ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold" style={{ color: 'oklch(0.45 0.18 264)' }}>
                  Entrar
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}