import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  ShoppingCart,
  Wrench,
  Settings,
  LogOut,
  HardHat // <- Ícone sugerido para Locações/Equipamentos
} from 'lucide-react'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',     adminOnly: false },
  { to: '/obras',         icon: Building2,       label: 'Obras',         adminOnly: false },
  { to: '/clientes',      icon: Users,           label: 'Clientes',      adminOnly: true  },
  { to: '/trabalhadores', icon: Briefcase,       label: 'Equipe',        adminOnly: true  },
  { to: '/orcamentos',    icon: FileText,        label: 'Orçamentos',    adminOnly: true  },
  { to: '/materiais',     icon: ShoppingCart,    label: 'Materiais',     adminOnly: false },
  { to: '/locacoes',      icon: HardHat,         label: 'Locações',      adminOnly: true  },
  // NOVO LINK INSERIDO AQUI:
  { to: '/servicos-avulsos', icon: Wrench,       label: 'Serv. Avulsos', adminOnly: true  },
  { to: '/configuracoes', icon: Settings,        label: 'Configurações', adminOnly: false },
]

export function Sidebar() {
  const { usuario, logout, isAdmin } = useAuth()

  const itensVisiveis = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E6ED',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
    }}>

      {/* Logo */}
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          color: '#0F172A',
          lineHeight: 1,
        }}>
          Obras<span style={{ color: '#2563EB' }}>App</span>
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
          Gestão de obras
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {itensVisiveis.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              height: '40px',
              padding: '0 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#2563EB' : '#64748B',
              background: isActive ? '#EFF6FF' : 'transparent',
              transition: 'all .15s ease',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              if (!el.style.background.includes('EFF6FF')) {
                el.style.background = '#F1F5F9'
                el.style.color = '#0F172A'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              if (!el.style.background.includes('EFF6FF')) {
                el.style.background = 'transparent'
                el.style.color = '#64748B'
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  style={{ color: isActive ? '#2563EB' : '#94A3B8', flexShrink: 0 }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usuário */}
      <div style={{ borderTop: '1px solid #E2E6ED', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderRadius: '10px',
          background: '#F8FAFC',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2563EB',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '13px',
            flexShrink: 0,
          }}>
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: '600',
              fontSize: '13px',
              color: '#0F172A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {usuario?.nome}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {usuario?.perfil}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'transparent',
            color: '#94A3B8',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all .15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#FEF2F2'
            ;(e.currentTarget as HTMLElement).style.color = '#EF4444'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = '#94A3B8'
          }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}