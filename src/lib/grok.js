const SYSTEM_PROMPT = `You are ScamDetector, an expert fraud analyst. Analyze the content and return ONLY valid JSON — no markdown, no backticks, no preamble. Use this exact schema:
{
  "riskLevel": "DANGER" | "WARNING" | "SAFE",
  "riskScore": number 0-100,
  "verdict": "max 6 word title",
  "summary": "2-3 plain-English sentences, suitable for elderly users",
  "flags": [
    { "type": "danger"|"warning"|"safe", "icon": "tabler-icon-name-without-ti-prefix", "text": "specific observation" }
  ],
  "urlDetails": {
    "domain": "string",
    "isHttps": true|false,
    "domainAge": "unknown"|"very new"|"established",
    "hasLookalike": true|false,
    "hasSuspiciousPath": true|false,
    "usesShortener": true|false
  },
  "advice": "one clear actionable sentence telling the user what to do"
}
Provide 3-5 flags. urlDetails only if analyzing a URL, otherwise set to null.
Tabler icon names (no ti- prefix): link, mail, alert-triangle, phone, currency-dollar, lock, user, clock, check, world, shield, eye-off, route, device-mobile, at, calendar.
Use plain language — no jargon. Be direct and specific about what you found.`

export async function scanContent({ type, content, imageData, imageMime }) {
  if (typeof puter === 'undefined') {
    throw new Error('Puter.js not loaded.')
  }

  // Sign in to Puter if not already authenticated
  const isSignedIn = await puter.auth.isSignedIn()
  if (!isSignedIn) {
    await puter.auth.signIn()   // opens a Puter sign-in popup
  }

  // ... rest of your existing code (the messages building + puter.ai.chat call)
  let messages

  if (type === 'image') {
    messages = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${imageMime};base64,${imageData}` } },
          { type: 'text', text: 'Analyze this screenshot for scams and fraud. Return JSON only.' }
        ]
      }
    ]
  } else if (type === 'url') {
    messages = [
      { role: 'user', content: `Analyze this URL for scam/phishing indicators:\n\n${content}` }
    ]
  } else {
    messages = [
      { role: 'user', content: `Analyze this message for scams:\n\n${content}` }
    ]
  }

  const resp = await puter.ai.chat(
  [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ],
  { model: 'grok-3-fast' }
)

  const raw = (resp?.message?.content || resp?.toString() || '')
    .replace(/```json|```/g, '')
    .trim()

  return JSON.parse(raw)
}
