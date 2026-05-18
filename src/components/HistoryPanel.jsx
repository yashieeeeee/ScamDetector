const ICONS = { text: 'ti-message-2', url: 'ti-link', image: 'ti-camera' }
const DOT = { DANGER: '#FF4444', WARNING: '#F5A623', SAFE: '#4CAF7D' }
const SCORE_COLOR = { DANGER: '#FF6B6B', WARNING: '#ffc355', SAFE: '#6fcf97' }

export default function HistoryPanel({ history, onSelect, onClear, isSynced }) {
  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div style={S.title}>
          <i className="ti ti-history" style={{ fontSize: 15 }} />
          Scan History
          {isSynced && (
            <span style={S.syncTag}>
              <i className="ti ti-cloud-check" style={{ fontSize: 11 }} /> synced
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button style={S.clearBtn} onClick={onClear}>
            <i className="ti ti-trash" style={{ fontSize: 12 }} /> Clear all
          </button>
        )}
      </div>

      <div style={S.list}>
        {history.length === 0
          ? <div style={S.empty}><i className="ti ti-inbox" style={{ fontSize: 22, display: 'block', marginBottom: 6 }} />No scans yet</div>
          : history.map((s, i) => <HistoryItem key={s.id || i} scan={s} onClick={() => onSelect(s)} />)
        }
      </div>
    </div>
  )
}

function HistoryItem({ scan, onClick }) {
  const { verdict, riskLevel, riskScore, scanType, preview, ts } = scan
  const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date = new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
  const isToday = new Date(ts).toDateString() === new Date().toDateString()
  return (
    <div style={S.item} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div style={{ ...S.dot, background: DOT[riskLevel] || '#444458', boxShadow: `0 0 6px ${DOT[riskLevel] || '#444458'}` }} />
      <div style={S.itemContent}>
        <div style={S.itemVerdict}>
          <i className={`ti ${ICONS[scanType] || 'ti-message-2'}`} style={{ fontSize: 11, marginRight: 4 }} />
          {verdict}
        </div>
        <div style={S.itemPreview}>{preview}</div>
      </div>
      <div style={S.itemMeta}>
        <div style={{ ...S.itemScore, color: SCORE_COLOR[riskLevel] }}>{Math.round(riskScore)}/100</div>
        <div style={{ color: '#444458' }}>{isToday ? time : date}</div>
      </div>
    </div>
  )
}

const S = {
  panel: { background: '#111114', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' },
  header: { padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  title: { fontSize: 14, fontWeight: 600, color: '#F0F0F2', display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Syne', sans-serif" },
  syncTag: { fontSize: 11, color: '#4CAF7D', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 400, fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { fontSize: 12, color: '#444458', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', borderRadius: 5, fontFamily: "'DM Sans', sans-serif" },
  list: { maxHeight: 320, overflowY: 'auto' },
  empty: { padding: '2rem 1rem', textAlign: 'center', color: '#444458', fontSize: 14 },
  item: { padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, transition: 'background 0.1s' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  itemContent: { flex: 1, minWidth: 0 },
  itemVerdict: { fontSize: 14, fontWeight: 600, color: '#F0F0F2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" },
  itemPreview: { fontSize: 12, color: '#444458', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 },
  itemMeta: { fontSize: 11, textAlign: 'right', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" },
  itemScore: { fontSize: 13, fontWeight: 700, marginBottom: 2 },
}