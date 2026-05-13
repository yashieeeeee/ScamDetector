import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSharedResult } from '../lib/db'

const LEVEL = {
  DANGER:  { cls: 'danger',  icon: 'ti-shield-x',           label: 'High risk — likely scam', bar: '#E24B4A', pill: { bg: '#FCEBEB', color: '#A32D2D' } },
  WARNING: { cls: 'warning', icon: 'ti-shield-exclamation', label: 'Caution — suspicious',    bar: '#EF9F27', pill: { bg: '#FAEEDA', color: '#854F0B' } },
  SAFE:    { cls: 'safe',    icon: 'ti-shield-check',       label: 'Low risk — looks safe',   bar: '#639922', pill: { bg: '#EAF3DE', color: '#27500A' } },
}

const FLAG_STYLE = {
  danger:  { bg: '#FCEBEB', iconColor: '#A32D2D', textColor: '#791F1F' },
  warning: { bg: '#FAEEDA', iconColor: '#854F0B', textColor: '#633806' },
  safe:    { bg: '#EAF3DE', iconColor: '#27500A', textColor: '#3B6D11' },
}

const ICON_BG = {
  DANGER:  '#FCEBEB', WARNING: '#FAEEDA', SAFE: '#EAF3DE'
}
const ICON_COLOR = {
  DANGER: '#E24B4A', WARNING: '#BA7517', SAFE: '#3B6D11'
}

export default function ScanResult({ result, onReset }) {
  const [shareState, setShareState] = useState('idle') // idle | loading | done
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
      // Fallback: encode in URL
      const payload = btoa(JSON.stringify({ v: verdict, l: riskLevel, s: Math.round(riskScore), a: advice })).substring(0, 28)
      const url = `${window.location.origin}/r/${payload}`
      setShareUrl(url)
      navigator.clipboard?.writeText(url).catch(() => {})
      setShareState('done')
    }
    setTimeout(() => setShareState('idle'), 6000)
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={{ ...S.iconCircle, background: ICON_BG[riskLevel] }}>
            <i className={`ti ${lvl.icon}`} style={{ fontSize: 22, color: ICON_COLOR[riskLevel] }} />
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

        {/* ── Risk bar ── */}
        <div style={S.barWrap}>
          <div style={S.barLabels}><span>Risk score</span><span>{Math.round(riskScore)}/100</span></div>
          <div style={S.barBg}>
            <div style={{ ...S.barFill, width: `${Math.round(riskScore)}%`, background: lvl.bar }} />
          </div>
        </div>

        <div style={S.divider} />

        <div style={S.body}>
          {/* Summary */}
          <p style={S.summary}>{summary}</p>

          {/* URL breakdown */}
          {scanType === 'url' && urlDetails && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={S.sectionLabel}><i className="ti ti-link" style={{ fontSize: 12 }} /> URL breakdown</div>
              <UrlTable u={urlDetails} />
            </div>
          )}

          {/* Flags */}
          <div style={S.sectionLabel}><i className="ti ti-list-check" style={{ fontSize: 12 }} /> What we found</div>
          <div style={S.flags}>
            {(flags || []).map((f, i) => {
              const fs = FLAG_STYLE[f.type] || FLAG_STYLE.safe
              return (
                <div key={i} style={{ ...S.flag, background: fs.bg }}>
                  <i className={`ti ti-${f.icon}`} style={{ fontSize: 14, color: fs.iconColor, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: fs.textColor }}>{f.text}</span>
                </div>
              )
            })}
          </div>

          {/* Advice */}
          <div style={S.adviceBox}>
            <div style={S.adviceTitle}><i className="ti ti-bulb" style={{ fontSize: 12 }} /> What to do</div>
            <div style={S.adviceText}>{advice}</div>
          </div>
        </div>
      </div>

      {/* Share toast */}
      {shareState === 'done' && (
        <div style={S.shareToast}>
          <i className="ti ti-check" style={{ fontSize: 15, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 3 }}>Link copied to clipboard!</div>
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
        <button
          style={{ ...S.actionBtn, ...S.actionBtnPrimary }}
          onClick={() => navigate('/family')}
        >
          <i className="ti ti-users" style={{ fontSize: 14 }} /> Share with family
        </button>
      </div>
    </div>
  )
}

function UrlTable({ u }) {
  const rows = [
    ['world',     'Domain',        u.domain || '—',                          false],
    ['lock',      'HTTPS secure',  u.isHttps ? 'Yes' : 'No — unsafe',        !u.isHttps],
    ['clock',     'Domain age',    u.domainAge || 'Unknown',                  u.domainAge === 'very new'],
    ['eye-off',   'Lookalike brand', u.hasLookalike ? 'Detected' : 'Not found', u.hasLookalike],
    ['route',     'URL shortener', u.usesShortener ? 'Yes — hides destination' : 'No', u.usesShortener],
  ]
  return (
    <div style={S.urlTable}>
      {rows.map(([icon, label, val, danger]) => (
        <div key={label} style={S.urlRow}>
          <span style={S.urlKey}><i className={`ti ti-${icon}`} style={{ fontSize: 13 }} />{label}</span>
          <span style={{ fontWeight: 500, color: danger ? '#A32D2D' : '#1a1a18' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

const S = {
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' },
  header: { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pill: { display: 'inline-block', fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', padding: '2px 8px', borderRadius: 20, marginBottom: 3 },
  verdict: { fontSize: 19, fontWeight: 500, color: '#1a1a18' },
  shareBtn: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '5px 9px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#888', cursor: 'pointer', flexShrink: 0 },
  miniSpin: { display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#666', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  barWrap: { padding: '0 1.25rem 1rem' },
  barLabels: { fontSize: 12, color: '#888', marginBottom: 5, display: 'flex', justifyContent: 'space-between' },
  barBg: { height: 7, background: '#f0ede6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' },
  divider: { height: '0.5px', background: 'rgba(0,0,0,0.07)', margin: '0 1.25rem' },
  body: { padding: '1.25rem' },
  summary: { fontSize: 15, lineHeight: 1.7, color: '#1a1a18', marginBottom: '1.25rem' },
  sectionLabel: { fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 },
  flags: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem' },
  flag: { display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 11px', borderRadius: 8 },
  urlTable: { marginBottom: '1.25rem', borderRadius: 8, overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.08)' },
  urlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: 13, background: '#fff' },
  urlKey: { color: '#888', display: 'flex', alignItems: 'center', gap: 6 },
  adviceBox: { padding: '11px 13px', background: '#EEF5FF', borderRadius: 8, border: '0.5px solid #C5D9F5' },
  adviceTitle: { fontSize: 12, fontWeight: 500, color: '#185FA5', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 },
  adviceText: { fontSize: 14, color: '#185FA5', lineHeight: 1.6 },
  shareToast: { marginTop: '0.75rem', padding: '10px 13px', background: '#EAF3DE', border: '0.5px solid #B5D88A', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8, color: '#3B6D11' },
  shareLink: { fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 2 },
  actions: { display: 'flex', gap: 7, marginTop: '0.75rem', flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: 110, padding: '9px 10px', fontSize: 13, borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' },
  actionBtnPrimary: { background: '#E24B4A', color: '#fff', border: 'none' },
}
