import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ObrasPage } from './pages/obras/ObrasPage'
import { ClientesPage } from './pages/clientes/ClientesPage'
import { TrabalhadoresPage } from './pages/trabalhadores/TrabalhadoresPage'
import { OrcamentosPage } from './pages/orcamentos/OrcamentosPage'
import { MateriaisPage } from './pages/materiais/MateriaisPage'
import { LocacoesPage } from './pages/locacoes/LocacoesPage'
import { ConfiguracoesPage } from './pages/configuracoes/ConfiguracoesPage'
// NOVA IMPORTAÇÃO:
import { ServicosAvulsosPage } from './pages/servicos-avulsos/ServicosAvulsosPage'

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--concrete)' }}>
        <div className="text-amber-500 text-xl">Carregando...</div>
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { usuario } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={usuario ? <Navigate to="/" replace /> : <RegisterPage />} />
      
      <Route path="/" element={
        <RotaProtegida>
          <Layout />
        </RotaProtegida>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="obras" element={<ObrasPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="trabalhadores" element={<TrabalhadoresPage />} />
        <Route path="orcamentos" element={<OrcamentosPage />} />
        <Route path="materiais" element={<MateriaisPage />} />
        <Route path="locacoes" element={<LocacoesPage />} />
        {/* NOVA ROTA INSERIDA AQUI: */}
        <Route path="servicos-avulsos" element={<ServicosAvulsosPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}