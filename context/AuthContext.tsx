'use client'

import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import type { User } from '@/types'
import type { RegisterPayload, LoginPayload } from '@/lib/api'

// ============================================================
// TYPES
// ============================================================

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  setUser: Dispatch<SetStateAction<User | null>>
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | null>(null)

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // --- Restore sesi saat mount ---
  useEffect(() => {
    const savedToken = localStorage.getItem('rentgo_token')
    if (!savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    setToken(savedToken)

    authApi.me()
      .then((userData) => {
        setUser(userData)
      })
      .catch(() => {
        // Token tidak valid, bersihkan
        localStorage.removeItem('rentgo_token')
        localStorage.removeItem('rentgo_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // --- Login ---
  const login = async (payload: LoginPayload): Promise<User> => {
    const data = await authApi.login(payload)

    localStorage.setItem('rentgo_token', data.accessToken)
    localStorage.setItem('rentgo_user', JSON.stringify(data.user))

    setToken(data.accessToken)
    setUser(data.user)

    return data.user
  }

  // --- Register ---
  const register = async (payload: RegisterPayload): Promise<User> => {
    const newUser = await authApi.register(payload)
    return newUser
  }

  // --- Logout ---
  const logout = () => {
    localStorage.removeItem('rentgo_token')
    localStorage.removeItem('rentgo_user')
    setToken(null)
    setUser(null)
    toast.success('Berhasil logout')
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  }
  return ctx
}