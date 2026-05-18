import { useState, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'
import { scanContent } from '../lib/grok'
import { saveScam, fetchScans, deleteAllScans } from '../lib/db'
import ScanInput from '../components/ScanInput'
import ScanResult from '../components/ScanResult'
import HistoryPanel from '../components/HistoryPanel'
import AuthModal from '../components/AuthModal'
import { isSupabaseReady } from '../lib/supabase'

export default function HomePage() {
  const { user } = useAuth()
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [history, setHistory]         = useState([])
  const [showAuth, setShowAuth]       = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [skipped, setSkipped]         = useState(false)

  useEffect(() => {
    if (isSupabaseReady && !user && !skipped) {
      const timer = setTimeout(() => setShowAuth(true), 800)
      return () => clearTimeout(timer)
    }
  }, [user, skipped])

  useEffect(() => {
    if (user) {
      fetchScans(user.id).then(scans => {
        setHistory(scans)
        if (scans.length > 0) setShowHistory(true)
      })
    }
  }, [user])

  async function handleScan({ type, content, imageData, imageMime }) {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await scanContent({ type, content, imageData, imageMime })
      const scan = { ...data, scanType: type, preview: content.substring(0, 100), ts: new Date().toISOString() }
      setResult(scan)
      setHistory(prev => [{ ...scan, id: 'local_' + Date.now() }, ...prev])
      setShowHistory(true)
      if (user) {
        const saved = await saveScam(user.id, scan)
        if (saved) setHistory(prev => prev.map((s, i) => i === 0 ? { ...s, id: saved.id } : s))
      }
    } catch (e) {
      console.error(e)
      setError('Analysis failed. Make sure you have a Puter account and try again.')
    }
    setLoading(false)
  }

  async function handleClearHistory() {
    if (user) await deleteAllScans(user.id)
    setHistory([])
  }

  function handleSelectHistory(scan) {
    setResult(scan)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>

      {/* Header */}
      <div style={S.pageHeader}>
        <div>
          <div style={S.eyebrow}><span style={S.eyebrowDot} />AI-Powered Protection</div>
          <h1 style={S.pageTitle}>Scan for Scams</h1>
          <p style={S.pageSub}>Paste any message, email, or link — get instant analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {!user && isSupabaseReady && (
            <button style={S.headerBtn} onClick={() => setShowAuth(true)}>
              <i className="ti ti-user" style={{ fontSize: 14 }} /> Sign in
            </button>
          )}
          {history.length > 0 && (
            <button style={S.headerBtn} onClick={() => setShowHistory(v => !v)}>
              <i className="ti ti-history" style={{ fontSize: 14 }} />
              History <span style={S.badge}>{history.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Puter banner */}
      <div style={S.puterBanner}>
        <div style={S.bannerLeft}>
          <div style={S.bannerIcon}><i className="ti ti-brand-puter" style={{ fontSize: 14, color: '#F5A623' }} /></div>
          <span><strong style={{ color: '#F0F0F2' }}>Free AI via Puter & Grok.</strong>{' '}
          <span style={{ color: '#8888A0' }}>Sign in with a free Puter account on your first scan.</span></span>
        </div>
      </div>

      {!isSupabaseReady && (
        <div style={S.configBanner}>
          <div style={S.bannerLeft}>
            <div style={{ ...S.bannerIcon, background: 'rgba(255,255,255,0.04)' }}>
              <i className="ti ti-settings" style={{ fontSize: 14, color: '#8888A0' }} />
            </div>
            <span><strong style={{ color: '#F0F0F2' }}>Supabase not configured.</strong>{' '}
            <span style={{ color: '#8888A0' }}>Copy <code style={S.code}>.env.example</code> to <code style={S.code}>.env</code> and add your credentials.</span></span>
          </div>
        </div>
      )}

      {user && (
        <div style={S.syncBanner}>
          <i className="ti ti-cloud-check" style={{ fontSize: 14, color: '#4CAF7D' }} />
          <span>Signed in as <strong style={{ color: '#F0F0F2' }}>{user.email}</strong> — history syncing across devices</span>
        </div>
      )}

      {showHistory && history.length > 0 && (
        <HistoryPanel history={history} onSelect={handleSelectHistory} onClear={handleClearHistory} isSynced={!!user} />
      )}

      <ScanInput onScan={handleScan} loading={loading} />

      {error && (
        <div style={S.errorCard}>
          <i className="ti ti-alert-circle" style={{ fontSize: 18, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {result && <ScanResult result={result} onReset={() => setResult(null)} />}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSkip={() => { setShowAuth(false); setSkipped(true) }} />
      )}
    </div>
  )
}

const S = {
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: 12, flexWrap: 'wrap' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#FF4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontFamily: "'Syne', sans-serif" },
  eyebrowDot: { width: 6, height: 6, borderRadius: '50%', background: '#FF4444', display: 'inline-block', animation: 'pulse-red 2s infinite' },
  pageTitle: { fontSize: 28, fontWeight: 800, color: '#F0F0F2', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif", lineHeight: 1.2, marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#8888A0', marginTop: 2 },
  headerBtn: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#8888A0', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  badge: { background: '#FF4444', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' },
  puterBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 10, marginBottom: '0.75rem', fontSize: 13 },
  configBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: '0.75rem', fontSize: 13 },
  bannerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  bannerIcon: { width: 28, height: 28, borderRadius: 7, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  code: { fontFamily: 'monospace', fontSize: 12, background: 'rgba(255,255,255,0.08)', color: '#F0F0F2', padding: '1px 6px', borderRadius: 4 },
  syncBanner: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', background: 'rgba(76,175,125,0.08)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: 10, marginBottom: '1rem', fontSize: 13, color: '#8888A0' },
  errorCard: { marginTop: '0.75rem', padding: '12px 14px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 10, fontSize: 14, color: '#FF6B6B', display: 'flex', alignItems: 'center', gap: 8 },
}