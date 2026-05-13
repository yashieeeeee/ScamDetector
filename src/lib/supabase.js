import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('[ScamDetector] Supabase credentials missing. Copy .env.example to .env and fill in your values.')
}

export const supabase = (url && key) ? createClient(url, key) : null

export const isSupabaseReady = !!(url && key)
