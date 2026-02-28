import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../api'

interface AuthState {
  user: User | null
  token: string | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        return { token, user: JSON.parse(userStr) as User }
      } catch {
        return { token: null, user: null }
      }
    }
    return { token: null, user: null }
  })

  useEffect(() => {
    if (auth.token && auth.user) {
      localStorage.setItem('token', auth.token)
      localStorage.setItem('user', JSON.stringify(auth.user))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [auth])

  const login = (token: string, user: User) => {
    setAuth({ token, user })
  }

  const logout = () => {
    setAuth({ token: null, user: null })
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
