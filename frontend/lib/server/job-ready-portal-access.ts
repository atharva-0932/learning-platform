import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function isJobReadyPortalUnlocked(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('job_ready_portal_unlocked_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[job-ready-portal] unlock lookup failed:', error.message)
    return false
  }

  return Boolean(data?.job_ready_portal_unlocked_at)
}

/** Returns a 403 JSON response when locked, or null when the user may access the portal. */
export async function requireJobReadyPortalUnlocked(
  supabase: SupabaseClient,
  userId: string,
): Promise<NextResponse | null> {
  const unlocked = await isJobReadyPortalUnlocked(supabase, userId)
  if (unlocked) return null
  return NextResponse.json(
    {
      error: 'Job Ready portal is locked. Complete payment to unlock company research, mock interviews, and job listings.',
      code: 'JOB_READY_PORTAL_LOCKED',
    },
    { status: 403 },
  )
}
