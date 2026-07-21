import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Settings,
  Mic
} from 'lucide-react'

const leftItems = [
  { to: '/',      icon: LayoutDashboard, label: 'Início',    end: true  },
  { to: '/obras', icon: Building2,       label: 'Obras',     end: false },
]

const rightItems = [
  { to: '/materiais',     icon: ShoppingCart, label: 'Materiais', end: false },
  { to: '/configuracoes', icon: Settings,     label: 'Config',    end: false },
]

export function BottomNav() {
  return (
    <nav style={{
      height: '72px',
      background: '#FFFFFF',
      borderTop: '1px solid #E2E6ED',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      position: 'relative',
      boxShadow: '0 -4px 24px rgba(15,23,42,0.07)',
    }}>

      {/* Itens esquerda */}
      {leftItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            color: isActive ? '#2563EB' : '#94A3B8',
            padding: '4px 12px',
            transition: 'color .15s ease',
          })}
        >
          <Icon size={20} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
        </NavLink>
      ))}

      {/* FAB central — botão de voz em destaque */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Anel externo decorativo */}
        <div style={{
          position: 'absolute',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'rgba(37,99,235,0.08)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
        <button
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, calc(-50% - 18px))',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37,99,235,0.35), 0 2px 8px rgba(37,99,235,0.2)',
            cursor: 'pointer',
            transition: 'transform .15s ease, box-shadow .15s ease',
            zIndex: 10,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, calc(-50% - 18px)) scale(1.06)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, calc(-50% - 18px)) scale(1)'
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, calc(-50% - 18px)) scale(0.95)'
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, calc(-50% - 18px)) scale(1.06)'
          }}
          aria-label="Comando de voz"
        >
          <Mic size={24} />
        </button>
        {/* Placeholder de espaço para o FAB não sobrepor os itens */}
        <div style={{ width: '64px' }} />
      </div>

      {/* Itens direita */}
      {rightItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            color: isActive ? '#2563EB' : '#94A3B8',
            padding: '4px 12px',
            transition: 'color .15s ease',
          })}
        >
          <Icon size={20} />
          <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
