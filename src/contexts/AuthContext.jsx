import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// ─── Admin UID (hard-coded as specified) ─────────────────────────────────────
const ADMIN_UID = 'Tq2O90cywWNJOFwxYRw7qV67Y2t2'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // Firebase user object
  const [role, setRole]       = useState('volunteer') // 'admin' | 'leader' | 'volunteer'
  const [loading, setLoading] = useState(true)

  // ── Derive role from UID + Firestore ────────────────────────────────────────
  async function resolveRole(firebaseUser) {
    if (!firebaseUser) {
      setRole('volunteer')
      return
    }
    if (firebaseUser.uid === ADMIN_UID) {
      setRole('admin')
      return
    }
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (snap.exists() && snap.data().role === 'leader') {
        setRole('leader')
      } else {
        setRole('volunteer')
      }
    } catch {
      setRole('volunteer')
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      await resolveRole(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Auth helpers ────────────────────────────────────────────────────────────
  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const loginWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider())

  const logout = () => signOut(auth)

  // ── Convenience booleans ────────────────────────────────────────────────────
  const isAdmin    = role === 'admin'
  const isLeader   = role === 'leader'
  const canManage  = isAdmin || isLeader   // can add/edit events

  const value = {
    user,
    role,
    isAdmin,
    isLeader,
    canManage,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
