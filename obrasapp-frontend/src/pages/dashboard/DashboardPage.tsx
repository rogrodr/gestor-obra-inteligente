import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { ResumoDashboard, FluxoCaixaMensal } from '../../types/dashboard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Building2,
  CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const PRIMARY = 'oklch(0.45 0.18 264)'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const statusLabels: Record<string, { label: string; color: string }> = {
  EM_ANDAMENTO: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  CONCLUIDA: { label: 'Concluída', color: 'bg-green-100 text-green-700' },
  ORCAMENTO: { label: 'Orçamento', color: 'bg-amber-100 text-amber-700' },
  PAUSADA: { label: 'Pausada', color: 'bg-slate-100 text-slate-700' },
}

export function DashboardPage() {
  const [dados, setDados] = useState<ResumoDashboard | null>(null)
  const [fluxo, setFluxo] = useState<FluxoCaixaMensal | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const [dashboardRes, fluxoRes] = await Promise.all([
          api.get<ResumoDashboard>('/obras/dashboard'),
          api.get<FluxoCaixaMensal>('/obras/fluxo-caixa', {
            params: { ano: new Date().getFullYear() },
          }),
        ])
        setDados(dashboardRes.data)
        setFluxo(fluxoRes.data)
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  if (carregando) {
    return (
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
    )
  }

  if (!dados) {
    return (
        <div className="p-6 text-center text-slate-500">
          Não foi possível carregar o dashboard.
        </div>
    )
  }

  const { resumo, ultimosLancamentos, obrasRecentes } = dados

  const dadosGrafico = fluxo?.meses.map((m) => ({
    mes: m.nomeMes.slice(0, 3).replace(/^\w/, (c) => c.toUpperCase()),
    Entradas: m.entradas,
    Saídas: m.saidas,
  })) ?? []

  return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral do seu negócio</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 size={20} style={{ color: PRIMARY }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{resumo.obrasAtivas}</p>
              <p className="text-xs text-slate-500 mt-0.5">Obras ativas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{resumo.obrasConcluidas}</p>
              <p className="text-xs text-slate-500 mt-0.5">Concluídas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 truncate">{formatarMoeda(resumo.totalEntradas)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total recebido</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Wallet size={20} style={{ color: PRIMARY }} />
                </div>
              </div>
              <p className={`text-xl font-bold truncate ${resumo.saldoGeral >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                {formatarMoeda(resumo.saldoGeral)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Saldo geral</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Gráfico de fluxo de caixa */}
          <Card className="rounded-2xl border-slate-200 shadow-sm md:col-span-2">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Fluxo de caixa</h2>
              <p className="text-sm text-slate-500">{fluxo?.ano}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dadosGrafico} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false}
                         tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                      formatter={(value: number) => formatarMoeda(value)}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Entradas" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Saídas" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Obras recentes */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Obras recentes</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {obrasRecentes.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Nenhuma obra cadastrada</p>
              )}
              {obrasRecentes.map((obra) => {
                const status = statusLabels[obra.status] ?? { label: obra.status, color: 'bg-slate-100 text-slate-700' }
                return (
                    <div key={obra.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{obra.nome}</p>
                        <p className="text-xs text-slate-500 truncate">{obra.cliente?.nome}</p>
                      </div>
                      <Badge className={`${status.color} border-0 shrink-0 text-xs font-medium`}>
                        {status.label}
                      </Badge>
                    </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Últimos lançamentos */}
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">Últimos lançamentos</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {ultimosLancamentos.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Nenhum lançamento registrado</p>
            )}
            {ultimosLancamentos.map((lanc) => (
                <div key={lanc.id} className="flex items-center justify-between gap-3 py-2.5 px-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        lanc.tipo === 'ENTRADA' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {lanc.tipo === 'ENTRADA'
                          ? <ArrowUpRight size={16} className="text-green-600" />
                          : <ArrowDownRight size={16} className="text-red-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{lanc.descricao}</p>
                      <p className="text-xs text-slate-500 truncate">{lanc.obraNome} · {formatarData(lanc.createdAt)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold shrink-0 ${
                      lanc.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {lanc.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(lanc.valor)}
                  </p>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
  )
}