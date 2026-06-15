import { createContext, useContext, useState } from 'react'

const ADMIN_PASSWORD = 'Ministry2025'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const login = (password) => {
    if (password === ADMIN_PASSWORD) { setIsAdmin(true); return true }
    return false
  }
  const logout = () => setIsAdmin(false)

  return (
    <AuthContext.Provider value={{ isAdmin, canManage: isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
