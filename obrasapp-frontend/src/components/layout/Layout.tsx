import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useOfflineSync } from '../../hooks/useOfflineSync'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function Layout() {
  const { isOnline, syncing, pendingCount, syncFeedback } = useOfflineSync()

  const showBanner = !isOnline || syncing || syncFeedback

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'row',
    }}>

      {/* ── Banner global ── */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: '40px',
          background: '#EF4444',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <WifiOff size={14} />
          <span>Sem conexão — {pendingCount} {pendingCount === 1 ? 'item' : 'itens'} aguardando</span>
        </div>
      )}

      {isOnline && (syncing || syncFeedback) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: '40px',
          background: '#2563EB',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <RefreshCw size={14} className="animate-spin" />
          <span>{syncFeedback || 'Sincronizando dados...'}</span>
        </div>
      )}

      {/* ── Sidebar desktop ── */}
      <div className="hidden md:block" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* ── Conteúdo principal ── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: showBanner ? '40px' : '0',
      }}>

        {/* Header mobile */}
        <header className="md:hidden" style={{
          position: 'sticky',
          top: showBanner ? '40px' : '0',
          zIndex: 40,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E6ED',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '-0.4px',
            color: '#0F172A',
          }}>
            Obras<span style={{ color: '#2563EB' }}>App</span>
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '999px',
            background: isOnline ? '#F0FDF4' : '#FEF2F2',
            color: isOnline ? '#16A34A' : '#DC2626',
            fontSize: '11px',
            fontWeight: 700,
          }}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </header>

        {/* Main */}
        <main style={{
          flex: 1,
          overflowX: 'hidden',
          padding: '24px 16px 96px',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}
          className="md:!px-8 xl:!px-12"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <div className="md:hidden" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}>
        <BottomNav />
      </div>
    </div>
  )
}
