import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import {
  listarComandosPendentes,
  atualizarStatusComando,
  removerComando
} from '../services/db'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Atualiza o contador de comandos pendentes
  const atualizarContador = useCallback(async () => {
    try {
      const pendentes = await listarComandosPendentes()
      setPendingCount(pendentes.length)
    } catch (err) {
      console.error('Erro ao contar comandos offline:', err)
    }
  }, [])

  // Sincroniza os comandos pendentes com o backend
  const syncComandos = useCallback(async () => {
    if (!navigator.onLine) return
    const pendentes = await listarComandosPendentes()
    if (pendentes.length === 0) return

    setSyncing(true)
    setSyncFeedback(`Sincronizando ${pendentes.length} comandos offline...`)
    
    let sucessos = 0
    let falhas = 0

    for (const cmd of pendentes) {
      if (!cmd.id) continue
      try {
        const response = await api.post('/ia/comando', {
          texto: cmd.texto,
          obraId: cmd.obraId
        })
        
        if (response.data?.sucesso) {
          // Se deu sucesso na IA, podemos remover do banco local
          await removerComando(cmd.id)
          sucessos++
        } else {
          // IA não entendeu ou retornou erro lógico, marca como falhado para o usuário revisar
          await atualizarStatusComando(cmd.id, 'falhou', response.data?.mensagem || 'Erro na resposta do Gemini')
          falhas++
        }
      } catch (error: any) {
        console.error(`Erro ao sincronizar comando ${cmd.id}:`, error)
        const erroMsg = error.response?.data?.message || error.message || 'Erro de rede'
        await atualizarStatusComando(cmd.id, 'falhou', erroMsg)
        falhas++
      }
    }

    await atualizarContador()
    setSyncing(false)
    
    if (sucessos > 0 || falhas > 0) {
      setSyncFeedback(`Sincronização concluída: ${sucessos} com sucesso, ${falhas} falhas.`)
      setTimeout(() => setSyncFeedback(null), 4000)
      
      // Forçar atualização da interface disparando um evento global
      window.dispatchEvent(new Event('offline-sync-done'))
    }
  }, [atualizarContador])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncComandos()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Executa contagem inicial
    atualizarContador()

    // Ouve eventos de novos comandos adicionados offline para atualizar o contador
    const handleNovoComando = () => {
      atualizarContador()
    }
    window.addEventListener('novo-comando-offline', handleNovoComando)

    // Se estiver online na inicialização, tenta sincronizar
    if (navigator.onLine) {
      syncComandos()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('novo-comando-offline', handleNovoComando)
    }
  }, [syncComandos, atualizarContador])

  return {
    isOnline,
    syncing,
    pendingCount,
    syncFeedback,
    syncComandos,
    atualizarContador,
  }
}
