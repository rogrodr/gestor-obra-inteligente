import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'ADMIN' | 'AJUDANTE'
}

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  carregando: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token')
    const usuarioSalvo = localStorage.getItem('usuario')

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo)
      setUsuario(JSON.parse(usuarioSalvo))
    }

    setCarregando(false)
  }, [])

  async function login(email: string, senha: string) {
    const { data } = await api.post('/autenticacao/login', { email, senha })
    
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    
    setToken(data.access_token)
    setUsuario(data.usuario)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      login,
      logout,
      isAdmin: usuario?.perfil === 'ADMIN',
      carregando,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)