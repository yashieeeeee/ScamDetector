import { supabase } from './supabase'

// ─── Scans ────────────────────────────────────────────────────────────────────

export async function saveScam(userId, scan) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.from('scans').insert({
    user_id: userId,
    scan_type: scan.scanType,
    content_preview: scan.preview,
    risk_level: scan.riskLevel,
    risk_score: Math.round(scan.riskScore),
    verdict: scan.verdict,
    summary: scan.summary,
    advice: scan.advice,
    flags: scan.flags,
    url_details: scan.urlDetails || null,
    created_at: new Date().toISOString()
  }).select().single()
  if (error) console.error('[db] saveScam:', error)
  return data
}

export async function fetchScans(userId, limit = 50) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('[db] fetchScans:', error); return [] }
  return (data || []).map(normalizeRow)
}

export async function deleteAllScans(userId) {
  if (!supabase || !userId) return
  const { error } = await supabase.from('scans').delete().eq('user_id', userId)
  if (error) console.error('[db] deleteAllScans:', error)
}

export async function deleteScan(id) {
  if (!supabase) return
  const { error } = await supabase.from('scans').delete().eq('id', id)
  if (error) console.error('[db] deleteScan:', error)
}

// ─── Shared results ───────────────────────────────────────────────────────────

export async function saveSharedResult(scan) {
  if (!supabase) return null
  const slug = generateSlug()
  const { data, error } = await supabase.from('shared_results').insert({
    slug,
    verdict: scan.verdict,
    risk_level: scan.riskLevel,
    risk_score: Math.round(scan.riskScore),
    summary: scan.summary,
    advice: scan.advice,
    flags: scan.flags,
    scan_type: scan.scanType,
    created_at: new Date().toISOString()
  }).select().single()
  if (error) { console.error('[db] saveSharedResult:', error); return null }
  return data?.slug || slug
}

export async function fetchSharedResult(slug) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shared_results')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error('[db] fetchSharedResult:', error); return null }
  return data
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') console.error('[db] fetchProfile:', error)
  return data || null
}

export async function upsertProfile(userId, updates) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) console.error('[db] upsertProfile:', error)
  return data
}

// ─── Family sharing ───────────────────────────────────────────────────────────

export async function fetchFamilyMembers(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('family_members')
    .select('*, profiles(email, display_name, avatar_color)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
  if (error) { console.error('[db] fetchFamilyMembers:', error); return [] }
  return data || []
}

export async function inviteFamilyMember(ownerId, email) {
  if (!supabase || !ownerId) return null
  const { data, error } = await supabase.from('family_members').insert({
    owner_id: ownerId,
    invited_email: email,
    status: 'pending',
    created_at: new Date().toISOString()
  }).select().single()
  if (error) { console.error('[db] inviteFamilyMember:', error); return null }
  return data
}

export async function removeFamilyMember(id) {
  if (!supabase) return
  const { error } = await supabase.from('family_members').delete().eq('id', id)
  if (error) console.error('[db] removeFamilyMember:', error)
}

export async function fetchFamilyScans(ownerId, limit = 30) {
  if (!supabase || !ownerId) return []
  // Get member user_ids linked to this owner
  const { data: members } = await supabase
    .from('family_members')
    .select('member_user_id')
    .eq('owner_id', ownerId)
    .eq('status', 'accepted')
    .not('member_user_id', 'is', null)
  if (!members || !members.length) return []
  const ids = members.map(m => m.member_user_id)
  const { data, error } = await supabase
    .from('scans')
    .select('*, profiles(display_name, email)')
    .in('user_id', ids)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('[db] fetchFamilyScans:', error); return [] }
  return (data || []).map(normalizeRow)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeRow(r) {
  return {
    id: r.id,
    verdict: r.verdict,
    riskLevel: r.risk_level,
    riskScore: r.risk_score,
    summary: r.summary,
    advice: r.advice,
    flags: r.flags,
    scanType: r.scan_type,
    preview: r.content_preview,
    urlDetails: r.url_details,
    ts: r.created_at,
    profile: r.profiles || null
  }
}

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
