import { createClient } from '@/lib/supabase/server'
import { enqueueArchieRoadmapAndAwaitBundle } from '@/lib/server/archie-roadmap-async'
import { buildLearnerContextPayload } from '@/lib/server/learner-context'
import { normalizeArchieRoadmapBundle } from '@/lib/agents/normalize-roadmap'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as {
      roadmap_intent: 'skills' | 'job_ready'
      direction?: string
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    const direction =
      (body.direction && body.direction.trim()) ||
      (profile?.learning_direction as string | undefined)?.trim() ||
      ''
    if (!direction) {
      return NextResponse.json({ error: 'Missing learning direction (save your goal first).' }, { status: 400 })
    }

    const learner = await buildLearnerContextPayload(supabase, user.id, {
      direction,
      roadmap_intent: body.roadmap_intent,
    })

    const raw = await enqueueArchieRoadmapAndAwaitBundle({
      context: { ...learner, roadmap_intent: body.roadmap_intent },
      userId: user.id,
    })
    const bundle = normalizeArchieRoadmapBundle(raw)

    const { error: snapErr } = await supabase.from('archie_roadmap_snapshots').insert({
      user_id: user.id,
      roadmap_mode: body.roadmap_intent,
      bundle: raw as never,
    })
    if (snapErr) {
      console.warn('archie_roadmap_snapshots insert:', snapErr.message)
    }

    return NextResponse.json({ bundle, raw })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
