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
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [history, setHistory]       = useState([])
  const [showAuth, setShowAuth]     = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [skipped, setSkipped]       = useState(false)

  // Show auth prompt on first visit if supabase is configured and user not signed in
  useEffect(() => {
    if (isSupabaseReady && !user && !skipped) {
      const timer = setTimeout(() => setShowAuth(true), 800)
      return () => clearTimeout(timer)
    }
  }, [user, skipped])

  // Load history when user signs in
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
      const scan = {
        ...data,
        scanType: type,
        preview: content.substring(0, 100),
        ts: new Date().toISOString(),
      }
      setResult(scan)
      // Prepend to local history
      setHistory(prev => [{ ...scan, id: 'local_' + Date.now() }, ...prev])
      setShowHistory(true)
      // Persist to Supabase
      if (user) {
        const saved = await saveScam(user.id, scan)
        if (saved) {
          setHistory(prev => prev.map((s, i) => i === 0 ? { ...s, id: saved.id } : s))
        }
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
    <div>
      {/* Header */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Scan for scams</h1>
          <p style={S.pageSub}>Paste any message, email, or link — get instant AI analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!user && isSupabaseReady && (
            <button style={S.signInBtn} onClick={() => setShowAuth(true)}>
              <i className="ti ti-user" style={{ fontSize: 14 }} /> Sign in
            </button>
          )}
          {history.length > 0 && (
            <button style={S.historyToggle} onClick={() => setShowHistory(v => !v)}>
              <i className="ti ti-history" style={{ fontSize: 14 }} />
              History
              <span style={S.badge}>{history.length}</span>
            </button>
          )}
        
        </div>
      </div>
      <div style={S.configBanner}>
  <i className="ti ti-brand-puter" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
  <div>
    <strong>Free AI powered by Puter.</strong> You'll be asked to sign in with a free Puter account on your first scan.
  </div>
</div>
      {/* Config warning */}
      {!isSupabaseReady && (
        <div style={S.configBanner}>
          <i className="ti ti-settings" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Supabase not configured.</strong> Copy <code style={S.code}>.env.example</code> to <code style={S.code}>.env</code> and add your credentials to enable sign-in and history sync.
          </div>
        </div>
      )}

      {/* Sync banner */}
      {user && (
        <div style={S.syncBanner}>
          <i className="ti ti-cloud-check" style={{ fontSize: 15 }} />
          Signed in as <strong>{user.email}</strong> — history syncing across devices
        </div>
      )}

      {/* History */}
      {showHistory && history.length > 0 && (
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
          isSynced={!!user}
        />
      )}

      {/* Scan input */}
      <ScanInput onScan={handleScan} loading={loading} />

      {/* Error */}
      {error && (
        <div style={S.errorCard}>
          <i className="ti ti-alert-circle" style={{ fontSize: 18 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && <ScanResult result={result} onReset={() => setResult(null)} />}

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSkip={() => { setShowAuth(false); setSkipped(true) }}
        />
      )}
    </div>
  )
}

const S = {
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: 12, flexWrap: 'wrap' },
  pageTitle: { fontSize: 24, fontWeight: 600, color: '#1a1a18', letterSpacing: '-0.3px' },
  pageSub: { fontSize: 14, color: '#888', marginTop: 3 },
  signInBtn: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff', color: '#555', cursor: 'pointer' },
  historyToggle: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff', color: '#555', cursor: 'pointer' },
  badge: { background: '#E24B4A', color: '#fff', fontSize: 10, fontWeight: 500, minWidth: 17, height: 17, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' },
  configBanner: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: '#FFF8E6', border: '0.5px solid #F5D97A', borderRadius: 8, marginBottom: '1rem', fontSize: 13, color: '#7A5800' },
  code: { fontFamily: 'monospace', fontSize: 12, background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 },
  syncBanner: { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', background: '#EAF3DE', border: '0.5px solid #B5D88A', borderRadius: 8, marginBottom: '1rem', fontSize: 13, color: '#3B6D11' },
  errorCard: { marginTop: '0.75rem', padding: '12px 14px', background: '#FCEBEB', border: '0.5px solid #F5BCBC', borderRadius: 8, fontSize: 14, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 },
}
