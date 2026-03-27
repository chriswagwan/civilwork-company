import { useEffect, useMemo, useState } from 'react'
import client from '../api/client.js'
import { AuthContext, STORAGE_KEY } from './auth-context.js'

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY)
    return storedAuth ? JSON.parse(storedAuth) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  const login = async (payload) => {
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login', payload)
      setAuth(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const { data } = await client.post('/auth/register', payload)
      setAuth(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => setAuth(null)

  const value = useMemo(
    () => ({
      auth,
      user: auth,
      isAuthenticated: Boolean(auth?.token),
      loading,
      login,
      register,
      logout,
    }),
    [auth, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
