import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseReady } from './supabase'
import { fetchProfile, upsertProfile } from './db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseReady) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user)
      else { setUser(null); setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(u) {
    setUser(u)
    const p = await fetchProfile(u.id)
    if (!p) {
      // Create profile on first sign-in
      const created = await upsertProfile(u.id, {
        email: u.email,
        display_name: u.email.split('@')[0],
        avatar_color: randomColor()
      })
      setProfile(created)
    } else {
      setProfile(p)
    }
    setLoading(false)
  }

  async function sendMagicLink(email) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(updates) {
    if (!user) return
    const updated = await upsertProfile(user.id, updates)
    setProfile(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isReady: isSupabaseReady, sendMagicLink, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

const COLORS = ['#E24B4A','#378ADD','#639922','#BA7517','#7C5CBF','#E67E22','#16A085']
function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)] }
