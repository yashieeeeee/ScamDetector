import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase reads the hash/query params from the URL automatically
    // on createClient — so just wait for session and redirect
    const check = async () => {
      if (!supabase) { navigate('/'); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/', { replace: true })
      } else {
        // Poll briefly in case the session is still being established
        let attempts = 0
        const interval = setInterval(async () => {
          attempts++
          const { data: { session: s } } = await supabase.auth.getSession()
          if (s || attempts > 10) {
            clearInterval(interval)
            navigate('/', { replace: true })
          }
        }, 500)
      }
    }
    check()
  }, [])

  return (
    <div style={S.page}>
      <div style={S.spinner} />
      <div style={S.icon}><i className="ti ti-shield-check" style={{ fontSize: 24, color: '#E24B4A' }} /></div>
      <h2 style={S.title}>Signing you in...</h2>
      <p style={S.sub}>Just a moment — setting up your ScamDetector account.</p>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#f8f7f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 },
  spinner: { width: 36, height: 36, border: '2.5px solid #e5e5e5', borderTopColor: '#E24B4A', borderRadius: '50%', animation: 'spin 0.75s linear infinite', marginBottom: 20 },
  icon: { width: 52, height: 52, background: '#FCEBEB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a18', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888' },
}
