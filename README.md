# ScamDetector 🛡️

AI-powered scam detection — paste any message, email, or link and instantly know if it's a scam. Powered by **Grok AI via Puter.js** (free, no API key needed) + **Supabase** for auth and persistent history.

---

## Features

- 🔍 **3 scan modes** — message/email text, URL/link, screenshot image
- 🤖 **Grok AI analysis** — risk score, verdict, detailed flags, plain-English advice
- 🔐 **Magic link auth** — no password, just email. One tap to sign in.
- 📱 **History sync** — scans saved to Supabase and synced across all devices
- 👨‍👩‍👧 **Family sharing** — invite family members, monitor their scans
- 🔗 **Shareable links** — share any result with a public URL
- 👤 **Profile & stats** — display name, avatar color, scan breakdown

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd scamdetector
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: `http://localhost:5173` (dev) or your production URL
   - **Redirect URLs**: same as above + `/auth/callback`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## File Structure

```
scamdetector/
├── index.html                  # Entry — loads Puter.js + Tabler Icons
├── vite.config.js
├── .env.example
├── supabase/
│   └── schema.sql              # ← Run this in Supabase SQL Editor
└── src/
    ├── main.jsx                # React entry
    ├── App.jsx                 # Routes
    ├── index.css               # Global styles + tokens
    ├── lib/
    │   ├── supabase.js         # Supabase client
    │   ├── grok.js             # Grok AI scan via Puter.js
    │   ├── db.js               # All DB operations
    │   └── useAuth.js          # Auth context + hook
    ├── components/
    │   ├── Layout.jsx          # Sidebar + shell
    │   ├── AuthModal.jsx       # Magic link sign-in modal
    │   ├── ScanInput.jsx       # 3-tab input (text/url/image)
    │   ├── ScanResult.jsx      # Result card with share
    │   └── HistoryPanel.jsx    # Scan history list
    └── pages/
        ├── HomePage.jsx        # Main scan page
        ├── ProfilePage.jsx     # Profile + stats
        ├── FamilyPage.jsx      # Family sharing
        ├── SharedResultPage.jsx # Public result view
        └── AuthCallbackPage.jsx # Magic link redirect handler
```

---

## How Grok AI works (free)

This app uses **Puter.js** to call Grok via xAI's API at zero cost to you. Users sign in with their Puter account and the AI calls are billed to them. No API key needed on your end.

The `puter` global is loaded from `https://js.puter.com/v2/` in `index.html`.

---

## Deploying to production

```bash
npm run build
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, or any static host.

Don't forget to:
1. Update Supabase **Site URL** and **Redirect URLs** to your production domain
2. Add your production domain's environment variables to your host

---

## Adding Supabase in the future

All DB operations are in `src/lib/db.js`. To swap in a different database, just replace the functions in that file — the rest of the app doesn't care.
