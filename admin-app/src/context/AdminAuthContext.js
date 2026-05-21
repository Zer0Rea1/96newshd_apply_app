import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'

export const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('adminToken').then(async token => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me')
          if (!data.isAdmin) throw new Error('Not admin')
          setAdmin(data)
        } catch {
          await AsyncStorage.removeItem('adminToken')
        }
      }
      setLoading(false)
    })
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (!data.user.isAdmin) throw new Error('Not an admin account')
    await AsyncStorage.setItem('adminToken', data.token)
    setAdmin(data.user)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('adminToken')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
