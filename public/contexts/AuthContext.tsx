import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'Admin' | 'Organizer' | 'Volunteer'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, fullName: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/profile')
        setUser(response.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/v1/login', { email, password })
    setUser(response.data.user)
  }

  const register = async (email: string, fullName: string, password: string, phone?: string) => {
    const response = await axios.post('/api/v1/register', { email, fullName, password, phone, role: 'Volunteer' })
    setUser(response.data.user)
  }

  const logout = async () => {
    await axios.post('/api/v1/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
