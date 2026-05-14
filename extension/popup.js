const SYSTEM_PROMPT = `You are ScamDetector, an expert fraud analyst. Your job is to identify REAL scams — not flag innocent everyday messages.

CRITICAL RULES:
- A casual greeting like "hey bud", "hi", "how are you", "hello" is ALWAYS SAFE. riskScore 0-5.
- Normal messages from friends, family, or known services are SAFE.
- Only flag something as WARNING or DANGER if there are REAL scam signals: requests for money, gift cards, passwords, OTPs, urgent threats, suspicious links, prize claims, impersonation of banks/government, or too-good-to-be-true offers.
- Short vague messages with NO red flags = SAFE, riskScore under 15.
- Do NOT invent red flags. If you find nothing suspicious, say it is safe clearly and confidently.
- Being friendly or casual is NOT a red flag.

riskScore guide:
0-20 = SAFE (normal everyday message)
21-50 = WARNING (some suspicious elements but not definitive)
51-100 = DANGER (clear scam indicators present)

Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "riskLevel": "DANGER" | "WARNING" | "SAFE",
  "riskScore": number 0-100,
  "verdict": "max 6 word title",
  "summary": "2-3 plain-English sentences. If safe, say so clearly and reassuringly.",
  "flags": [
    { "type": "danger"|"warning"|"safe", "text": "specific observation" }
  ],
  "advice": "one clear actionable sentence"
}
Provide 2-4 flags. No jargon. Be direct.`

const icons = { SAFE: '✅', WARNING: '⚠️', DANGER: '🚨' }

const input = document.getElementById('input')
const scanBtn = document.getElementById('scanBtn')
const output = document.getElementById('output')

input.addEventListener('input', () => {
  scanBtn.disabled = !input.value.trim()
})

scanBtn.addEventListener('click', async () => {
  const content = input.value.trim()
  if (!content) return

  output.innerHTML = '<div class="loading"><span class="spinner"></span>Scanning...</div>'
  scanBtn.disabled = true

  try {
    const isSignedIn = await puter.auth.isSignedIn()
    if (!isSignedIn) await puter.auth.signIn()

    const resp = await puter.ai.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this for scams:\n\n${content}` }
      ],
      { model: 'grok-3-fast' }
    )

    const raw = (resp?.message?.content || resp?.toString() || '')
      .replace(/```json|```/g, '').trim()
    const result = JSON.parse(raw)

    const flagsHtml = result.flags.map(f =>
      `<div class="flag ${f.type}">${f.type === 'danger' ? '✕' : f.type === 'safe' ? '✓' : '!'} ${f.text}</div>`
    ).join('')

    output.innerHTML = `
      <div class="result ${result.riskLevel}">
        <div class="verdict-bar">
          <span class="icon">${icons[result.riskLevel]}</span>
          <span class="label">${result.verdict}</span>
          <span class="score">Risk: ${result.riskScore}/100</span>
        </div>
        <div class="summary">${result.summary}</div>
        <div class="flags">${flagsHtml}</div>
        <div class="advice">💡 ${result.advice}</div>
      </div>`
  } catch (e) {
    output.innerHTML = `<div class="error">❌ ${e.message || 'Analysis failed. Make sure you are signed into Puter.'}</div>`
  } finally {
    scanBtn.disabled = false
  }
})