'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  login as loginFn,
  logout as logoutFn,
  getStoredUser,
  isAuthenticated,
} from '@/lib/auth'
import { LoginPayload } from '@/lib/api'
import type { User } from '@/types'

/**
 * Hook untuk mengelola state autentikasi di komponen.
 * Pakai di client component ('use client').
 */
export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Saat mount, ambil user dari localStorage
  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await loginFn(payload)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    logoutFn()
    setUser(null)
    router.push('/')
  }, [router])

  return {
    user,
    loading,
    isLoggedIn: isAuthenticated(),
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
  }
}