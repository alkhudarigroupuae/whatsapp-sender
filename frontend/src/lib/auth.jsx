import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, getAuthToken, setAuthToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await apiFetch('/api/auth/me')
      setUser(res.user)
    } catch {
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signIn = useCallback(async ({ email, password }) => {
    const res = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
    setAuthToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const res = await apiFetch('/api/auth/register', { method: 'POST', body: { name, email, password } })
    setAuthToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const signInWithGoogle = useCallback(async (credential) => {
    const res = await apiFetch('/api/auth/google', { method: 'POST', body: { credential } })
    setAuthToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const signOut = useCallback(() => {
    setAuthToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, signIn, register, signInWithGoogle, signOut, refresh }),
    [user, loading, signIn, register, signInWithGoogle, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
