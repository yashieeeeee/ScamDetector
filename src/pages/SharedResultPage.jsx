import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSharedResult } from '../lib/db'

const LEVEL = {
  DANGER:  { icon: 'ti-shield-x',           label: 'High risk — likely scam', bar: '#E24B4A', iconBg: '#FCEBEB', iconColor: '#E24B4A', pill: { bg: '#FCEBEB', color: '#A32D2D' } },
  WARNING: { icon: 'ti-shield-exclamation', label: 'Caution — suspicious',    bar: '#EF9F27', iconBg: '#FAEEDA', iconColor: '#BA7517', pill: { bg: '#FAEEDA', color: '#854F0B' } },
  SAFE:    { icon: 'ti-shield-check',       label: 'Low risk — looks safe',   bar: '#639922', iconBg: '#EAF3DE', iconColor: '#3B6D11', pill: { bg: '#EAF3DE', color: '#27500A' } },
}
const FLAG_STYLE = {
  danger:  { bg: '#FCEBEB', iconColor: '#A32D2D', textColor: '#791F1F' },
  warning: { bg: '#FAEEDA', iconColor: '#854F0B', textColor: '#633806' },
  safe:    { bg: '#EAF3DE', iconColor: '#27500A', textColor: '#3B6D11' },
}

export default function SharedResultPage() {
  const { slug } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchSharedResult(slug).then(data => {
      if (data) {
        setResult({
          verdict: data.verdict,
          riskLevel: data.risk_level,
          riskScore: data.risk_score,
          summary: data.summary,
          advice: data.advice,
          flags: data.flags,
          scanType: data.scan_type,
        })
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) return (
    <div style={S.page}>
      <div style={S.loadWrap}>
        <div style={S.spinner} />
        <p style={{ fontSize: 14, color: '#888' }}>Loading result...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={S.page}>
      <div style={S.loadWrap}>
        <i className="ti ti-ghost" style={{ fontSize: 36, color: '#ddd', display: 'block', marginBottom: 12 }} />
        <p style={{ fontSize: 16, fontWeight: 500, color: '#555', marginBottom: 6 }}>Result not found</p>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>This link may have expired or the result was deleted.</p>
        <Link to="/" style={S.homeLink}><i className="ti ti-shield-search" style={{ fontSize: 14 }} /> Try ScamDetector free</Link>
      </div>
    </div>
  )

  const lvl = LEVEL[result.riskLevel] || LEVEL.SAFE

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* Brand header */}
        <div style={S.brandRow}>
          <div style={S.brandIcon}><i className="ti ti-shield-check" style={{ fontSize: 16, color: '#fff' }} /></div>
          <div>
            <div style={S.brandName}>ScamDetector</div>
            <div style={S.brandSub}>AI-powered fraud analysis</div>
          </div>
        </div>

        <div style={S.sharedLabel}><i className="ti ti-share" style={{ fontSize: 12 }} /> Shared scan result</div>

        {/* Result card */}
        <div style={S.card}>
          <div style={S.header}>
            <div style={{ ...S.iconCircle, background: lvl.iconBg }}>
              <i className={`ti ${lvl.icon}`} style={{ fontSize: 22, color: lvl.iconColor }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...S.pill, background: lvl.pill.bg, color: lvl.pill.color }}>{lvl.label}</div>
              <div style={S.verdict}>{result.verdict}</div>
            </div>
          </div>

          <div style={S.barWrap}>
            <div style={S.barLabels}><span>Risk score</span><span>{Math.round(result.riskScore)}/100</span></div>
            <div style={S.barBg}><div style={{ ...S.barFill, width: `${result.riskScore}%`, background: lvl.bar }} /></div>
          </div>

          <div style={S.divider} />

          <div style={S.body}>
            <p style={S.summary}>{result.summary}</p>

            {(result.flags || []).length > 0 && (
              <>
                <div style={S.sectionLabel}><i className="ti ti-list-check" style={{ fontSize: 12 }} /> What was found</div>
                <div style={S.flags}>
                  {result.flags.map((f, i) => {
                    const fs = FLAG_STYLE[f.type] || FLAG_STYLE.safe
                    return (
                      <div key={i} style={{ ...S.flag, background: fs.bg }}>
                        <i className={`ti ti-${f.icon}`} style={{ fontSize: 14, color: fs.iconColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: fs.textColor, lineHeight: 1.5 }}>{f.text}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div style={S.adviceBox}>
              <div style={S.adviceTitle}><i className="ti ti-bulb" style={{ fontSize: 12 }} /> What to do</div>
              <div style={S.adviceText}>{result.advice}</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={S.cta}>
          <p style={S.ctaText}>Received a suspicious message? Check it yourself — free.</p>
          <Link to="/" style={S.ctaBtn}>
            <i className="ti ti-shield-search" style={{ fontSize: 15 }} /> Scan a message now
          </Link>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#f8f7f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' },
  wrap: { width: '100%', maxWidth: 520 },
  loadWrap: { textAlign: 'center', padding: '4rem 1rem', width: '100%', maxWidth: 400 },
  spinner: { width: 32, height: 32, border: '2.5px solid #e5e5e5', borderTopColor: '#E24B4A', borderRadius: '50%', animation: 'spin 0.75s linear infinite', margin: '0 auto 1rem' },
  brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' },
  brandIcon: { width: 34, height: 34, background: '#E24B4A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName: { fontSize: 16, fontWeight: 600, color: '#1a1a18', letterSpacing: '-0.2px' },
  brandSub: { fontSize: 11, color: '#aaa' },
  sharedLabel: { fontSize: 12, color: '#aaa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' },
  header: { padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pill: { display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, marginBottom: 3 },
  verdict: { fontSize: 19, fontWeight: 500, color: '#1a1a18' },
  barWrap: { padding: '0 1.25rem 1rem' },
  barLabels: { fontSize: 12, color: '#888', marginBottom: 5, display: 'flex', justifyContent: 'space-between' },
  barBg: { height: 7, background: '#f0ede6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.7s' },
  divider: { height: '0.5px', background: 'rgba(0,0,0,0.07)', margin: '0 1.25rem' },
  body: { padding: '1.25rem' },
  summary: { fontSize: 15, lineHeight: 1.7, color: '#1a1a18', marginBottom: '1.25rem' },
  sectionLabel: { fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 },
  flags: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem' },
  flag: { display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 11px', borderRadius: 8 },
  adviceBox: { padding: '11px 13px', background: '#EEF5FF', borderRadius: 8, border: '0.5px solid #C5D9F5' },
  adviceTitle: { fontSize: 12, fontWeight: 500, color: '#185FA5', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 },
  adviceText: { fontSize: 14, color: '#185FA5', lineHeight: 1.6 },
  cta: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '1.25rem', textAlign: 'center' },
  ctaText: { fontSize: 14, color: '#888', marginBottom: 12 },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#E24B4A', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' },
  homeLink: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#E24B4A', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' },
}
