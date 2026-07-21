import { openDB, type DBSchema } from 'idb'

export interface ComandoVozOffline {
  id?: number
  texto: string
  obraId: string
  data: string
  status: 'pendente' | 'sincronizado' | 'falhou'
  tentativas: number
  erro?: string
}

interface ObrasAppDB extends DBSchema {
  comandosVoz: {
    key: number
    value: ComandoVozOffline
    indexes: { 'by-status': string }
  }
}

const DB_NAME = 'ObrasAppDB'
const DB_VERSION = 1

export const dbPromise = openDB<ObrasAppDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore('comandosVoz', {
      keyPath: 'id',
      autoIncrement: true,
    })
    store.createIndex('by-status', 'status')
  },
})

export async function salvarComandoOffline(texto: string, obraId: string) {
  const db = await dbPromise
  const comando: ComandoVozOffline = {
    texto,
    obraId,
    data: new Date().toISOString(),
    status: 'pendente',
    tentativas: 0,
  }
  await db.add('comandosVoz', comando)
}

export async function listarComandosPendentes() {
  const db = await dbPromise
  const tx = db.transaction('comandosVoz', 'readonly')
  const index = tx.store.index('by-status')
  return index.getAll('pendente')
}

export async function listarTodosComandos() {
  const db = await dbPromise
  return db.getAll('comandosVoz')
}

export async function atualizarStatusComando(id: number, status: 'sincronizado' | 'falhou', erro?: string) {
  const db = await dbPromise
  const tx = db.transaction('comandosVoz', 'readwrite')
  const comando = await tx.store.get(id)
  if (comando) {
    comando.status = status
    comando.tentativas += 1
    if (erro) comando.erro = erro
    await tx.store.put(comando)
  }
  await tx.done
}

export async function removerComando(id: number) {
  const db = await dbPromise
  await db.delete('comandosVoz', id)
}

export async function limparComandosSincronizados() {
  const db = await dbPromise
  const tx = db.transaction('comandosVoz', 'readwrite')
  const comandos = await tx.store.getAll()
  for (const cmd of comandos) {
    if (cmd.status === 'sincronizado' && cmd.id) {
      await tx.store.delete(cmd.id)
    }
  }
  await tx.done
}
