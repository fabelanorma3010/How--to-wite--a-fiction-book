import { createClient } from './supabase/server'

export interface SavedFile {
  id: string
  name: string
  url: string
  mimeType: string | null
  createdAt: string
}

/**
 * A member's saved files — currently just illustrations saved from the
 * Illustration tool. public.files has no public SELECT policy, so this only
 * ever returns something when called for the signed-in owner.
 */
export async function getUserFiles(userId: string): Promise<SavedFile[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('files')
    .select('id, name, url, mime_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  }))
}
