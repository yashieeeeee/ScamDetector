import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { fetchScans } from '../lib/db'

const COLORS = ['#E24B4A','#378ADD','#639922','#BA7517','#7C5CBF','#E67E22','#16A085']

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [avatarColor, setAvatarColor] = useState('#E24B4A')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [stats, setStats]             = useState(null)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (profile) {
      setDisplayName(profile.display_name || '')
      setAvatarColor(profile.avatar_color || '#E24B4A')
    }
    fetchScans(user.id, 200).then(scans => {
      const danger  = scans.filter(s => s.riskLevel === 'DANGER').length
      const warning = scans.filter(s => s.riskLevel === 'WARNING').length
      const safe    = scans.filter(s => s.riskLevel === 'SAFE').length
      setStats({ total: scans.length, danger, warning, safe })
    })
  }, [user, profile])

  async function handleSave() {
    setSaving(true)
    await updateProfile({ display_name: displayName, avatar_color: avatarColor })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!user) return null

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Profile & Settings</h1>
        <p style={S.sub}>Manage your account and view your scan stats</p>
      </div>

      {/* Avatar + name */}
      <div style={S.card}>
        <div style={S.sectionTitle}><i className="ti ti-user-circle" style={{ fontSize: 16 }} /> Your profile</div>

        <div style={S.avatarRow}>
          <div style={{ ...S.avatar, background: avatarColor }}>
            {(displayName || user.email || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={S.fieldLabel}>Avatar colour</div>
            <div style={S.colorPicker}>
              {COLORS.map(c => (
                <button
                  key={c}
                  style={{ ...S.colorSwatch, background: c, outline: avatarColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
                  onClick={() => setAvatarColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={S.field}>
          <label style={S.fieldLabel}>Display name</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" style={S.input} />
        </div>

        <div style={S.field}>
          <label style={S.fieldLabel}>Email</label>
          <input type="text" value={user.email} disabled style={{ ...S.input, color: '#aaa', cursor: 'not-allowed' }} />
          <div style={S.fieldNote}>Your email is used for sign-in only. We don't send marketing email.</div>
        </div>

        <button
          style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? <><i className="ti ti-check" /> Saved!</> : 'Save changes'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={S.card}>
          <div style={S.sectionTitle}><i className="ti ti-chart-bar" style={{ fontSize: 16 }} /> Your scan stats</div>
          <div style={S.statsGrid}>
            <StatCard value={stats.total}   label="Total scans"   color="#378ADD" icon="ti-shield-search" />
            <StatCard value={stats.danger}  label="Scams found"   color="#E24B4A" icon="ti-shield-x" />
            <StatCard value={stats.warning} label="Suspicious"    color="#EF9F27" icon="ti-shield-exclamation" />
            <StatCard value={stats.safe}    label="Safe"          color="#639922" icon="ti-shield-check" />
          </div>
          {stats.total > 0 && (
            <div style={S.safeRate}>
              <div style={S.safeRateLabel}>Scam detection rate</div>
              <div style={S.safeRateBar}>
                <div style={{ ...S.safeRateFill, width: `${Math.round((stats.danger / stats.total) * 100)}%` }} />
              </div>
              <div style={S.safeRateNote}>{Math.round((stats.danger / stats.total) * 100)}% of your scans were flagged as high risk</div>
            </div>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div style={{ ...S.card, border: '0.5px solid #F5BCBC' }}>
        <div style={S.sectionTitle}><i className="ti ti-alert-triangle" style={{ fontSize: 16, color: '#E24B4A' }} /> Account</div>
        <button style={S.signOutBtn} onClick={async () => { await signOut(); navigate('/') }}>
          <i className="ti ti-logout" style={{ fontSize: 15 }} /> Sign out of this device
        </button>
      </div>
    </div>
  )
}

function StatCard({ value, label, color, icon }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statIcon, background: color + '18' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  )
}

const S = {
  header: { marginBottom: '1.5rem' },
  title: { fontSize: 24, fontWeight: 600, color: '#1a1a18', letterSpacing: '-0.3px' },
  sub: { fontSize: 14, color: '#888', marginTop: 3 },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' },
  sectionTitle: { fontSize: 15, fontWeight: 500, color: '#1a1a18', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 7 },
  avatarRow: { display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: '1.25rem' },
  avatar: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: '#fff', flexShrink: 0 },
  colorPicker: { display: 'flex', gap: 7, marginTop: 6, flexWrap: 'wrap' },
  colorSwatch: { width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' },
  field: { marginBottom: '1rem' },
  fieldLabel: { fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' },
  fieldNote: { fontSize: 12, color: '#bbb', marginTop: 4 },
  input: { background: '#f8f7f5', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '9px 12px', fontSize: 15, color: '#1a1a18', width: '100%' },
  saveBtn: { padding: '9px 20px', fontSize: 14, fontWeight: 500, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' },
  statCard: { background: '#f8f7f5', borderRadius: 10, padding: '12px 10px', textAlign: 'center' },
  statIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  statValue: { fontSize: 22, fontWeight: 600, color: '#1a1a18' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  safeRate: { marginTop: 4 },
  safeRateLabel: { fontSize: 12, color: '#888', marginBottom: 5 },
  safeRateBar: { height: 6, background: '#f0ede6', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
  safeRateFill: { height: '100%', background: '#E24B4A', borderRadius: 3, transition: 'width 0.7s' },
  safeRateNote: { fontSize: 12, color: '#aaa' },
  signOutBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontSize: 14, background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F5BCBC', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
}
