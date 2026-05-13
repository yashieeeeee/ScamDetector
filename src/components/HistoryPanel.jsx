const ICONS = { text: 'ti-message-2', url: 'ti-link', image: 'ti-camera' }

const DOT = { DANGER: '#E24B4A', WARNING: '#EF9F27', SAFE: '#639922' }
const SCORE_COLOR = { DANGER: '#A32D2D', WARNING: '#854F0B', SAFE: '#27500A' }

export default function HistoryPanel({ history, onSelect, onClear, isSynced }) {
  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div style={S.title}>
          <i className="ti ti-history" style={{ fontSize: 15 }} />
          Scan history
          {isSynced && <span style={S.syncTag}><i className="ti ti-cloud-check" style={{ fontSize: 11 }} /> synced</span>}
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
          : history.map((s, i) => (
            <HistoryItem key={s.id || i} scan={s} onClick={() => onSelect(s)} />
          ))
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
      <div style={{ ...S.dot, background: DOT[riskLevel] || '#aaa' }} />
      <div style={S.itemContent}>
        <div style={S.itemVerdict}>
          <i className={`ti ${ICONS[scanType] || 'ti-message-2'}`} style={{ fontSize: 11, marginRight: 3 }} />
          {verdict}
        </div>
        <div style={S.itemPreview}>{preview}</div>
      </div>
      <div style={S.itemMeta}>
        <div style={{ ...S.itemScore, color: SCORE_COLOR[riskLevel] }}>{Math.round(riskScore)}/100</div>
        <div>{isToday ? time : date}</div>
      </div>
    </div>
  )
}

const S = {
  panel: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' },
  header: { padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(0,0,0,0.07)' },
  title: { fontSize: 15, fontWeight: 500, color: '#1a1a18', display: 'flex', alignItems: 'center', gap: 7 },
  syncTag: { fontSize: 11, color: '#639922', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 400 },
  clearBtn: { fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', borderRadius: 5 },
  list: { maxHeight: 380, overflowY: 'auto' },
  empty: { padding: '2rem 1rem', textAlign: 'center', color: '#bbb', fontSize: 14 },
  item: { padding: '0.875rem 1.25rem', borderBottom: '0.5px solid rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, transition: 'background 0.1s' },
  dot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  itemContent: { flex: 1, minWidth: 0 },
  itemVerdict: { fontSize: 14, fontWeight: 500, color: '#1a1a18', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemPreview: { fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 },
  itemMeta: { fontSize: 11, color: '#bbb', textAlign: 'right', flexShrink: 0 },
  itemScore: { fontSize: 13, fontWeight: 500, marginBottom: 2 },
}
