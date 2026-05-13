import { useState, useRef } from 'react'

const TEXT_EXAMPLES = [
  { label: 'Fake bank', value: 'Your bank account has been suspended. Verify immediately at secure-bank-login.xyz to avoid permanent closure.' },
  { label: 'Medicare', value: 'Hi, this is Sarah from Medicare. Your benefits are expiring. Call 1-800-555-0199 to renew — have your SSN ready.' },
  { label: 'Family scam', value: "Hi Mom, it's me. I lost my phone. Can you send $500 via Venmo to @help-me-now? I'll explain later." },
  { label: 'Gift card', value: "You've won a $1,000 Amazon gift card! Claim now before it expires: amaz0n-giftcard.xyz/claim" },
]

const URL_EXAMPLES = [
  { label: 'Fake Amazon', value: 'http://amaz0n-account-verify.tk/login?user=reset' },
  { label: 'Shortener',   value: 'https://bit.ly/3xFreeGift' },
  { label: 'Fake USPS',   value: 'https://usps-tracking-delivery.com/pay?id=4729' },
  { label: 'Safe site',   value: 'https://www.google.com' },
]

export default function ScanInput({ onScan, loading }) {
  const [tab, setTab]           = useState('text')
  const [text, setText]         = useState('')
  const [url, setUrl]           = useState('')
  const [imgData, setImgData]   = useState(null)
  const [imgMime, setImgMime]   = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  function handleTab(t) {
    setTab(t)
    setImgData(null); setImgMime(null); setImgPreview(null)
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setImgMime(file.type)
      setImgData(e.target.result.split(',')[1])
      setImgPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  function clearImage() { setImgData(null); setImgMime(null); setImgPreview(null); if (fileRef.current) fileRef.current.value = '' }

  function handleSubmit() {
    if (tab === 'text' && !text.trim()) return
    if (tab === 'url'  && !url.trim())  return
    if (tab === 'image' && !imgData)    { fileRef.current?.click(); return }
    onScan({ type: tab, content: tab === 'text' ? text : tab === 'url' ? url : '[screenshot]', imageData: imgData, imageMime: imgMime })
  }

  return (
    <div>
      {/* Tabs */}
      <div style={S.tabs} role="tablist">
        {[['text','ti-message-2','Message / Email'],['url','ti-link','URL / Link'],['image','ti-camera','Screenshot']].map(([t,icon,label]) => (
          <button key={t} role="tab" aria-selected={tab===t} style={{ ...S.tab, ...(tab===t ? S.tabActive : {}) }} onClick={() => handleTab(t)}>
            <i className={`ti ${icon}`} /> {label}
          </button>
        ))}
      </div>

      {/* Text panel */}
      {tab === 'text' && (
        <div style={S.card}>
          <label style={S.lbl}><i className="ti ti-clipboard-text" /> Paste your message, SMS, or email</label>
          <textarea rows={5} value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste any suspicious message, email body, pop-up text, or SMS here..." />
          <Examples items={TEXT_EXAMPLES} onSelect={setText} />
        </div>
      )}

      {/* URL panel */}
      {tab === 'url' && (
        <div style={S.card}>
          <label style={S.lbl}><i className="ti ti-world-search" /> Paste a suspicious link or URL</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="https://suspicious-site.com/claim?ref=xyz" />
          <div style={S.infoNote}>
            <i className="ti ti-info-circle" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Checks domain, HTTPS, lookalike brand names, shorteners, and path patterns — without visiting the link.</span>
          </div>
          <Examples items={URL_EXAMPLES} onSelect={setUrl} />
        </div>
      )}

      {/* Image panel */}
      {tab === 'image' && (
        <div style={S.card}>
          <label style={S.lbl}><i className="ti ti-photo-scan" /> Upload a screenshot of a suspicious message</label>
          <div
            style={{ ...S.dropZone, ...(dragging ? S.dropZoneDrag : {}) }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDrop={e => { e.preventDefault(); setDragging(false); handleImageFile(e.dataTransfer.files[0]) }}
            onDragLeave={() => setDragging(false)}
          >
            <i className="ti ti-cloud-upload" style={{ fontSize: 28, color: '#bbb', display: 'block', marginBottom: 8 }} />
            <p style={{ fontSize: 14, color: '#666' }}>Click to upload or drag & drop</p>
            <span style={{ fontSize: 12, color: '#aaa' }}>PNG, JPG, WEBP — screenshots of texts, emails, or pop-ups</span>
          </div>
          <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0])} />
          {imgPreview && (
            <div style={S.imgPreview}>
              <img src={imgPreview} alt="Screenshot preview" style={S.previewImg} />
              <button style={S.imgDel} onClick={clearImage} aria-label="Remove image"><i className="ti ti-x" /></button>
            </div>
          )}
        </div>
      )}

      {/* Scan button */}
      <button
        style={{ ...S.scanBtn, opacity: loading ? 0.5 : 1 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <><span style={S.btnSpinner} /> Analyzing...</>
          : <><i className="ti ti-shield-search" /> Scan now — powered by Grok</>
        }
      </button>
    </div>
  )
}

function Examples({ items, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#bbb' }}>Try:</span>
      {items.map(({ label, value }) => (
        <button key={label} style={S.exBtn} onClick={() => onSelect(value)}>{label}</button>
      ))}
    </div>
  )
}

const S = {
  tabs: { display: 'flex', gap: 3, marginBottom: '1rem', background: '#f0ede6', padding: 4, borderRadius: 10 },
  tab: { flex: 1, padding: '8px 6px', fontSize: 13, fontWeight: 500, border: 'none', background: 'transparent', color: '#888', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' },
  tabActive: { background: '#fff', color: '#1a1a18', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  lbl: { fontSize: 13, color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 },
  infoNote: { marginTop: 10, padding: '9px 12px', background: '#f8f7f5', borderRadius: 8, fontSize: 12, color: '#888', display: 'flex', gap: 7, alignItems: 'flex-start' },
  dropZone: { border: '1.5px dashed #ddd', borderRadius: 10, padding: '1.75rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', background: '#f8f7f5' },
  dropZoneDrag: { borderColor: '#E24B4A', background: '#fff' },
  imgPreview: { marginTop: 10, textAlign: 'center', position: 'relative', display: 'inline-block', width: '100%' },
  previewImg: { maxHeight: 160, borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)' },
  imgDel: { position: 'absolute', top: 4, right: 'calc(50% - 70px)', width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '0.5px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, color: '#888' },
  exBtn: { fontSize: 12, padding: '3px 9px', borderRadius: 20, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f8f7f5', color: '#888', cursor: 'pointer', transition: 'all 0.15s' },
  scanBtn: { width: '100%', padding: '13px', fontSize: 15, fontWeight: 500, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' },
  btnSpinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' },
}
