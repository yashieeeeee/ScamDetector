import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { fetchFamilyMembers, inviteFamilyMember, removeFamilyMember, fetchFamilyScans } from '../lib/db'

export default function FamilyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers]   = useState([])
  const [scans, setScans]       = useState([])
  const [email, setEmail]       = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [loadingScans, setLoadingScans] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadData()
  }, [user])

  async function loadData() {
    const [m, s] = await Promise.all([
      fetchFamilyMembers(user.id),
      (setLoadingScans(true), fetchFamilyScans(user.id).finally(() => setLoadingScans(false)))
    ])
    setMembers(m)
    setScans(s)
  }

  async function handleInvite() {
    if (!email.includes('@')) { setInviteMsg('Please enter a valid email.'); return }
    setInviting(true); setInviteMsg('')
    const result = await inviteFamilyMember(user.id, email)
    if (result) {
      setEmail('')
      setInviteMsg(`Invite sent to ${email}! They'll get an email to join.`)
      loadData()
    } else {
      setInviteMsg('Failed to send invite. Please try again.')
    }
    setInviting(false)
  }

  async function handleRemove(id) {
    await removeFamilyMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  if (!user) return null

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Family protection</h1>
        <p style={S.sub}>Invite family members so you can see their scan history and keep them safe from scams</p>
      </div>

      {/* How it works */}
      <div style={S.howCard}>
        <div style={S.howTitle}><i className="ti ti-bulb" style={{ fontSize: 15 }} /> How family sharing works</div>
        <div style={S.steps}>
          {[
            ['ti-mail','Invite a family member by email'],
            ['ti-user-check','They sign in with a magic link'],
            ['ti-eye','You can see all their scans here'],
            ['ti-bell','Get alerted when they find a scam'],
          ].map(([icon, text], i) => (
            <div key={i} style={S.step}>
              <div style={S.stepNum}>{i + 1}</div>
              <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#888' }} />
              <span style={{ fontSize: 13, color: '#555' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div style={S.card}>
        <div style={S.sectionTitle}><i className="ti ti-user-plus" style={{ fontSize: 16 }} /> Invite a family member</div>
        <div style={S.inviteRow}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="grandma@email.com"
            style={S.inviteInput}
          />
          <button style={{ ...S.inviteBtn, opacity: inviting ? 0.6 : 1 }} onClick={handleInvite} disabled={inviting}>
            {inviting ? 'Sending...' : <><i className="ti ti-send" style={{ fontSize: 14 }} /> Send invite</>}
          </button>
        </div>
        {inviteMsg && (
          <div style={{ ...S.inviteMsg, color: inviteMsg.includes('sent') ? '#3B6D11' : '#A32D2D', background: inviteMsg.includes('sent') ? '#EAF3DE' : '#FCEBEB', border: `0.5px solid ${inviteMsg.includes('sent') ? '#B5D88A' : '#F5BCBC'}` }}>
            <i className={`ti ${inviteMsg.includes('sent') ? 'ti-check' : 'ti-alert-circle'}`} />
            {inviteMsg}
          </div>
        )}
      </div>

      {/* Members list */}
      <div style={S.card}>
        <div style={S.sectionTitle}><i className="ti ti-users" style={{ fontSize: 16 }} /> Family members ({members.length})</div>
        {members.length === 0
          ? <div style={S.empty}><i className="ti ti-user-off" style={{ fontSize: 22, display: 'block', marginBottom: 6 }} />No family members yet. Invite someone above!</div>
          : members.map(m => <MemberRow key={m.id} member={m} onRemove={() => handleRemove(m.id)} />)
        }
      </div>

      {/* Family scans */}
      <div style={S.card}>
        <div style={S.sectionTitle}><i className="ti ti-history" style={{ fontSize: 16 }} /> Family scan activity</div>
        {loadingScans
          ? <div style={S.empty}><span style={S.miniSpin} /> Loading...</div>
          : scans.length === 0
          ? <div style={S.empty}><i className="ti ti-inbox" style={{ fontSize: 22, display: 'block', marginBottom: 6 }} />No family scans yet</div>
          : scans.map((scan, i) => <FamilyScanRow key={scan.id || i} scan={scan} />)
        }
      </div>
    </div>
  )
}

function MemberRow({ member, onRemove }) {
  const status = member.status || 'pending'
  const email  = member.invited_email || member.profiles?.email || '—'
  const name   = member.profiles?.display_name || email
  const STATUS_STYLE = {
    pending:  { bg: '#FAEEDA', color: '#854F0B', label: 'Invite pending' },
    accepted: { bg: '#EAF3DE', color: '#27500A', label: 'Active' },
    declined: { bg: '#FCEBEB', color: '#A32D2D', label: 'Declined' },
  }
  const ss = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <div style={S.memberRow}>
      <div style={{ ...S.memberAvatar, background: member.profiles?.avatar_color || '#E24B4A' }}>
        {name.substring(0, 2).toUpperCase()}
      </div>
      <div style={S.memberInfo}>
        <div style={S.memberName}>{name}</div>
        <div style={S.memberEmail}>{email}</div>
      </div>
      <span style={{ ...S.statusBadge, background: ss.bg, color: ss.color }}>{ss.label}</span>
      <button style={S.removeBtn} onClick={onRemove} aria-label="Remove member">
        <i className="ti ti-x" style={{ fontSize: 13 }} />
      </button>
    </div>
  )
}

const RISK_COLOR = { DANGER: '#E24B4A', WARNING: '#EF9F27', SAFE: '#639922' }

function FamilyScanRow({ scan }) {
  const time = new Date(scan.ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const name = scan.profile?.display_name || scan.profile?.email || 'Family member'
  return (
    <div style={S.scanRow}>
      <div style={{ ...S.riskDot, background: RISK_COLOR[scan.riskLevel] || '#aaa' }} />
      <div style={S.scanInfo}>
        <div style={S.scanVerdict}>{scan.verdict}</div>
        <div style={S.scanMeta}>{name} · {time}</div>
        <div style={S.scanPreview}>{scan.preview}</div>
      </div>
      <div style={{ ...S.scanScore, color: RISK_COLOR[scan.riskLevel] }}>{Math.round(scan.riskScore)}/100</div>
    </div>
  )
}

const S = {
  header: { marginBottom: '1.5rem' },
  title: { fontSize: 24, fontWeight: 600, color: '#1a1a18', letterSpacing: '-0.3px' },
  sub: { fontSize: 14, color: '#888', marginTop: 3, lineHeight: 1.5 },
  howCard: { background: '#EEF5FF', border: '0.5px solid #C5D9F5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  howTitle: { fontSize: 14, fontWeight: 500, color: '#185FA5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  steps: { display: 'flex', flexDirection: 'column', gap: 8 },
  step: { display: 'flex', alignItems: 'center', gap: 10 },
  stepNum: { width: 20, height: 20, borderRadius: '50%', background: '#185FA5', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' },
  sectionTitle: { fontSize: 15, fontWeight: 500, color: '#1a1a18', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 7 },
  inviteRow: { display: 'flex', gap: 8 },
  inviteInput: { flex: 1 },
  inviteBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 14, fontWeight: 500, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' },
  inviteMsg: { marginTop: 8, padding: '8px 12px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  empty: { textAlign: 'center', color: '#bbb', fontSize: 14, padding: '1.5rem 0' },
  memberRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' },
  memberAvatar: { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontSize: 14, fontWeight: 500, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  memberEmail: { fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statusBadge: { fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, flexShrink: 0 },
  removeBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '4px', borderRadius: 5, flexShrink: 0 },
  scanRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' },
  riskDot: { width: 9, height: 9, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  scanInfo: { flex: 1, minWidth: 0 },
  scanVerdict: { fontSize: 14, fontWeight: 500, color: '#1a1a18' },
  scanMeta: { fontSize: 12, color: '#aaa', marginTop: 2 },
  scanPreview: { fontSize: 12, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  scanScore: { fontSize: 13, fontWeight: 600, flexShrink: 0 },
  miniSpin: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#555', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
}
