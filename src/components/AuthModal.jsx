import { useState } from 'react'
import { useAuth } from '../lib/useAuth'

export default function AuthModal({ onClose, onSkip }) {
  const { sendMagicLink } = useAuth()
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSend() {
    setError('')
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      await sendMagicLink(email)
      setSent(true)
    } catch (e) {
      setError(e.message || 'Failed to send link. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onSkip?.()}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Sign in">
        {!sent ? (
          <>
            <div style={styles.iconWrap}>
              <i className="ti ti-mail-forward" style={{ fontSize: 24, color: '#E24B4A' }} />
            </div>
            <h2 style={styles.title}>Sign in to sync history</h2>
            <p style={styles.sub}>
              Enter your email and we'll send a one-tap magic link — no password, no hassle.
              Your scan history will sync across all your devices.
            </p>

            <div style={styles.inputRow}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={styles.emailInput}
                autoFocus
              />
              <button
                style={{ ...styles.sendBtn, opacity: loading ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={loading}
              >
                {loading
                  ? <span style={styles.spinner} />
                  : <><i className="ti ti-send" style={{ fontSize: 14 }} /> Send link</>
                }
              </button>
            </div>

            {error && <div style={styles.errorMsg}><i className="ti ti-alert-circle" /> {error}</div>}

            <p style={styles.note}>We only use your email to identify you. No spam, ever.</p>

            <div style={styles.divider}><hr style={styles.hr} /><span style={styles.orText}>or</span><hr style={styles.hr} /></div>

            <button style={styles.skipBtn} onClick={onSkip}>
              Continue without signing in
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>(history won't sync)</span>
            </button>
          </>
        ) : (
          <div style={styles.sentWrap}>
            <i className="ti ti-circle-check" style={{ fontSize: 40, color: '#639922', display: 'block', marginBottom: 12 }} />
            <h2 style={styles.title}>Check your inbox!</h2>
            <p style={styles.sub}>We sent a magic link to <strong>{email}</strong>. Click it to sign in — the link expires in 1 hour.</p>
            <button style={styles.skipBtn} onClick={onSkip}>Continue without signing in for now</button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem'
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: '2rem',
    width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  iconWrap: {
    width: 52, height: 52, background: '#FCEBEB', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
  },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a18', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 },
  inputRow: { display: 'flex', gap: 8, marginBottom: 8 },
  emailInput: { flex: 1, minWidth: 0 },
  sendBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 16px', fontSize: 14, fontWeight: 500,
    background: '#E24B4A', color: '#fff', border: 'none',
    borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'opacity 0.15s'
  },
  spinner: {
    display: 'inline-block', width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite'
  },
  errorMsg: { fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 },
  note: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 6 },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '1rem 0' },
  hr: { flex: 1, border: 'none', borderTop: '0.5px solid #e5e5e5' },
  orText: { fontSize: 12, color: '#bbb' },
  skipBtn: {
    width: '100%', padding: '9px', fontSize: 13,
    color: '#888', background: 'transparent',
    border: '0.5px solid #ddd', borderRadius: 8, cursor: 'pointer',
    transition: 'all 0.15s'
  },
  sentWrap: { textAlign: 'center' },
}
