import { createClient } from '@/lib/supabase/server'
import { fetchPipCheckpointReportForMilestone } from '@/lib/server/pip-checkpoint-reports'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: roadmapId } = await context.params
    const { searchParams } = new URL(request.url)
    const modeRaw = searchParams.get('roadmap_mode')
    const milestoneId = (searchParams.get('milestone_id') || '').trim()

    if (modeRaw !== 'skills' && modeRaw !== 'job_ready') {
      return NextResponse.json({ error: 'roadmap_mode must be skills or job_ready' }, { status: 400 })
    }
    if (!milestoneId) {
      return NextResponse.json({ error: 'milestone_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row } = await supabase
      .from('user_archie_roadmaps')
      .select('id')
      .eq('id', roadmapId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    const report = await fetchPipCheckpointReportForMilestone(
      supabase,
      user.id,
      roadmapId,
      modeRaw,
      milestoneId,
    )

    if (!report) {
      return NextResponse.json({ error: 'No report found for this milestone' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
