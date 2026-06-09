import { createClient } from '@/lib/supabase/server'
import { requireJobReadyPortalUnlocked } from '@/lib/server/job-ready-portal-access'
import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type GuardOk = { supabase: SupabaseClient; user: User }

/** Authenticates the caller and ensures the Job Ready portal is unlocked. */
export async function assertJobReadyApiAccess(): Promise<GuardOk | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locked = await requireJobReadyPortalUnlocked(supabase, user.id)
  if (locked) return locked

  return { supabase, user }
}
