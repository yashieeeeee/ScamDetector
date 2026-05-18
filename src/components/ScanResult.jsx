import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSharedResult } from '../lib/db'

const LEVEL = {
  DANGER:  { icon: 'ti-shield-x',           label: 'High Risk — Likely Scam', bar: '#FF4444', glow: 'rgba(255,68,68,0.2)',  bg: 'rgba(255,68,68,0.08)',  border: 'rgba(255,68,68,0.2)',  pill: { bg: 'rgba(255,68,68,0.15)', color: '#FF6B6B' } },
  WARNING: { icon: 'ti-shield-exclamation', label: 'Caution — Suspicious',    bar: '#F5A623', glow: 'rgba(245,166,35,0.2)', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)', pill: { bg: 'rgba(245,166,35,0.15)', color: '#ffc355' } },
  SAFE:    { icon: 'ti-shield-check',       label: 'Low Risk — Looks Safe',   bar: '#4CAF7D', glow: 'rgba(76,175,125,0.2)', bg: 'rgba(76,175,125,0.08)', border: 'rgba(76,175,125,0.2)', pill: { bg: 'rgba(76,175,125,0.15)', color: '#6fcf97' } },
}

const FLAG_STYLE = {
  danger:  { bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.15)',   iconColor: '#FF6B6B', textColor: '#FFAAAA' },
  warning: { bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.15)',  iconColor: '#ffc355', textColor: '#FFD98A' },
  safe:    { bg: 'rgba(76,175,125,0.08)',  border: 'rgba(76,175,125,0.15)',  iconColor: '#6fcf97', textColor: '#A8E6C4' },
}

export default function ScanResult({ result, onReset }) {
  const [shareState, setShareState] = useState('idle')
  const [shareUrl, setShareUrl]     = useState('')
  const navigate = useNavigate()

  if (!result) return null
  const { riskLevel, riskScore, verdict, summary, flags, urlDetails, advice, scanType } = result
  const lvl = LEVEL[riskLevel] || LEVEL.SAFE

  async function handleShare() {
    setShareState('loading')
    const slug = await saveSharedResult(result)
    if (slug) {
      const url = `${window.location.origin}/r/${slug}`
      setShareUrl(url)
      navigator.clipboard?.writeText(url).catch(() => {})
      setShareState('done')
    } else {
      const payload = btoa(JSON.stringify({ v: verdict, l: riskLevel, s: Math.round(riskScore), a: advice })).substring(0, 28)
      const url = `${window.location.origin}/r/${payload}`
      setShareUrl(url)
      navigator.clipboard?.writeText(url).catch(() => {})
      setShareState('done')
    }
    setTimeout(() => setShareState('idle'), 6000)
  }

  return (
    <div style={{ marginTop: '1rem', animation: 'fadeUp 0.4s ease forwards' }}>
      <div style={{ ...S.card, border: `1px solid ${lvl.border}` }}>

        {/* Header */}
        <div style={{ ...S.header, background: lvl.bg, borderBottom: `1px solid ${lvl.border}` }}>
          <div style={{ ...S.iconCircle, boxShadow: `0 0 20px ${lvl.glow}` }}>
            <i className={`ti ${lvl.icon}`} style={{ fontSize: 22, color: lvl.pill.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...S.pill, background: lvl.pill.bg, color: lvl.pill.color }}>{lvl.label}</div>
            <div style={S.verdict}>{verdict}</div>
          </div>
          <button style={S.shareBtn} onClick={handleShare} disabled={shareState === 'loading'}>
            {shareState === 'loading'
              ? <span style={S.miniSpin} />
              : <><i className="ti ti-share" style={{ fontSize: 13 }} /> Share</>
            }
          </button>
        </div>

        {/* Risk bar */}
        <div style={S.barWrap}>
          <div style={S.barLabels}>
            <span style={{ color: '#8888A0' }}>Risk score</span>
            <span style={{ color: lvl.pill.color, fontWeight: 700 }}>{Math.round(riskScore)}/100</span>
          </div>
          <div style={S.barBg}>
            <div style={{ ...S.barFill, width: `${Math.round(riskScore)}%`, background: lvl.bar, boxShadow: `0 0 8px ${lvl.glow}` }} />
          </div>
        </div>

        <div style={S.divider} />

        <div style={S.body}>
          {/* Summary */}
          <p style={S.summary}>{summary}</p>

          {/* URL breakdown */}
          {scanType === 'url' && urlDetails && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={S.sectionLabel}><i className="ti ti-link" style={{ fontSize: 12 }} /> URL Breakdown</div>
              <UrlTable u={urlDetails} />
            </div>
          )}

          {/* Flags */}
          <div style={S.sectionLabel}><i className="ti ti-list-check" style={{ fontSize: 12 }} /> What We Found</div>
          <div style={S.flags}>
            {(flags || []).map((f, i) => {
              const fs = FLAG_STYLE[f.type] || FLAG_STYLE.safe
              return (
                <div key={i} style={{ ...S.flag, background: fs.bg, border: `1px solid ${fs.border}` }}>
                  <i className={`ti ti-${f.icon}`} style={{ fontSize: 14, color: fs.iconColor, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: fs.textColor }}>{f.text}</span>
                </div>
              )
            })}
          </div>

          {/* Advice */}
          <div style={S.adviceBox}>
            <div style={S.adviceTitle}><i className="ti ti-bulb" style={{ fontSize: 12 }} /> What To Do</div>
            <div style={S.adviceText}>{advice}</div>
          </div>
        </div>
      </div>

      {/* Share toast */}
      {shareState === 'done' && (
        <div style={S.shareToast}>
          <i className="ti ti-check" style={{ fontSize: 15, flexShrink: 0, marginTop: 2, color: '#4CAF7D' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3, color: '#F0F0F2' }}>Link copied to clipboard!</div>
            <div style={S.shareLink}>{shareUrl}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={S.actions}>
        <button style={S.actionBtn} onClick={onReset}>
          <i className="ti ti-refresh" style={{ fontSize: 14 }} /> Scan another
        </button>
        <button style={S.actionBtn} onClick={handleShare}>
          <i className="ti ti-share" style={{ fontSize: 14 }} /> Share result
        </button>
        <button style={{ ...S.actionBtn, ...S.actionBtnPrimary }} onClick={() => navigate('/family')}>
          <i className="ti ti-users" style={{ fontSize: 14 }} /> Share with family
        </button>
      </div>
    </div>
  )
}

function UrlTable({ u }) {
  const rows = [
    ['world',   'Domain',         u.domain || '—',                            false],
    ['lock',    'HTTPS secure',   u.isHttps ? 'Yes' : 'No — unsafe',          !u.isHttps],
    ['clock',   'Domain age',     u.domainAge || 'Unknown',                    u.domainAge === 'very new'],
    ['eye-off', 'Lookalike brand',u.hasLookalike ? 'Detected' : 'Not found',  u.hasLookalike],
    ['route',   'URL shortener',  u.usesShortener ? 'Yes — hides destination' : 'No', u.usesShortener],
  ]
  return (
    <div style={S.urlTable}>
      {rows.map(([icon, label, val, danger]) => (
        <div key={label} style={S.urlRow}>
          <span style={S.urlKey}><i className={`ti ti-${icon}`} style={{ fontSize: 13 }} />{label}</span>
          <span style={{ fontWeight: 600, color: danger ? '#FF6B6B' : '#F0F0F2', fontSize: 13 }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

const S = {
  card: { background: '#111114', borderRadius: 14, overflow: 'hidden' },
  header: { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pill: { display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', padding: '3px 10px', borderRadius: 20, marginBottom: 4, textTransform: 'uppercase' },
  verdict: { fontSize: 19, fontWeight: 700, color: '#F0F0F2', fontFamily: "'Syne', sans-serif" },
  shareBtn: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#8888A0', cursor: 'pointer', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" },
  miniSpin: { display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#8888A0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  barWrap: { padding: '0 1.25rem 1rem' },
  barLabels: { fontSize: 12, marginBottom: 6, display: 'flex', justifyContent: 'space-between' },
  barBg: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 1.25rem' },
  body: { padding: '1.25rem' },
  summary: { fontSize: 15, lineHeight: 1.7, color: '#8888A0', marginBottom: '1.25rem' },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: '#444458', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Syne', sans-serif" },
  flags: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem' },
  flag: { display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 12px', borderRadius: 8 },
  urlTable: { marginBottom: '1.25rem', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' },
  urlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, background: '#18181C' },
  urlKey: { color: '#8888A0', display: 'flex', alignItems: 'center', gap: 7 },
  adviceBox: { padding: '12px 14px', background: 'rgba(74,158,255,0.08)', borderRadius: 10, border: '1px solid rgba(74,158,255,0.15)' },
  adviceTitle: { fontSize: 11, fontWeight: 600, color: '#4A9EFF', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.5px' },
  adviceText: { fontSize: 14, color: '#7BBFFF', lineHeight: 1.6 },
  shareToast: { marginTop: '0.75rem', padding: '10px 14px', background: 'rgba(76,175,125,0.08)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 },
  shareLink: { fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 2, color: '#8888A0' },
  actions: { display: 'flex', gap: 7, marginTop: '0.75rem', flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: 110, padding: '10px 10px', fontSize: 13, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#8888A0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" },
  actionBtnPrimary: { background: 'rgba(255,68,68,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,68,68,0.25)' },
}