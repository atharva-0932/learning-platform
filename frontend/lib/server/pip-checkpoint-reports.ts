import type { SupabaseClient } from '@supabase/supabase-js'

import { canonicalMilestoneId, parseWeekNumberFromMilestoneId } from '@/lib/archie-week-gate'
import type { PipCheckpointReportDetail, PipCheckpointReportSummary } from '@/lib/pip-checkpoint-report'

type ContextRow = {
  payload: unknown
  created_at: string
}

function payloadRecord(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null
  return payload as Record<string, unknown>
}

function reportFromPayload(row: ContextRow, roadmapMode: 'skills' | 'job_ready'): PipCheckpointReportDetail | null {
  const p = payloadRecord(row.payload)
  if (!p) return null
  if (p.roadmap_mode !== roadmapMode) return null

  const milestoneRaw = typeof p.milestone_id === 'string' ? p.milestone_id : ''
  const week =
    typeof p.week === 'number'
      ? p.week
      : parseWeekNumberFromMilestoneId(milestoneRaw)
  if (week == null || week < 1) return null

  const milestone_id = canonicalMilestoneId(week)
  const reportRaw = p.report
  const report =
    reportRaw && typeof reportRaw === 'object' ? (reportRaw as Record<string, unknown>) : null

  const assessment =
    (report?.assessment as Record<string, unknown> | undefined) ||
    (p.assessment as Record<string, unknown> | undefined) ||
    {}
  const answers =
    (report?.answers as Record<string, { mcq_index?: number; text?: string }> | undefined) ||
    (p.answers as Record<string, { mcq_index?: number; text?: string }> | undefined) ||
    {}
  const graded =
    (report?.graded as PipCheckpointReportDetail['graded'] | undefined) ||
    ({
      results: Array.isArray(p.results_preview) ? p.results_preview : [],
      score_percent: typeof p.score_percent === 'number' ? p.score_percent : 0,
      weak_topics: Array.isArray(p.weak_topics) ? p.weak_topics : [],
      pip_summary_for_archie:
        typeof p.pip_summary_for_archie === 'string' ? p.pip_summary_for_archie : undefined,
      flashcard_suggestions: Array.isArray(p.flashcard_suggestions) ? p.flashcard_suggestions : [],
    } satisfies PipCheckpointReportDetail['graded'])

  return {
    milestone_id,
    week,
    roadmap_mode: roadmapMode,
    roadmap_title: typeof p.roadmap_title === 'string' ? p.roadmap_title : null,
    submitted_at: row.created_at,
    score_percent: typeof p.score_percent === 'number' ? p.score_percent : graded.score_percent ?? 0,
    weak_topics: Array.isArray(p.weak_topics) ? (p.weak_topics as string[]) : [],
    pip_summary_for_archie:
      typeof p.pip_summary_for_archie === 'string' ? p.pip_summary_for_archie : null,
    flashcard_suggestions: Array.isArray(p.flashcard_suggestions)
      ? (p.flashcard_suggestions as PipCheckpointReportDetail['flashcard_suggestions'])
      : [],
    assessment,
    answers,
    graded,
    xp: report?.xp && typeof report.xp === 'object' ? (report.xp as PipCheckpointReportDetail['xp']) : null,
  }
}

export async function fetchPipCheckpointReportSummaries(
  supabase: SupabaseClient,
  userId: string,
  roadmapId: string,
  roadmapMode: 'skills' | 'job_ready',
): Promise<Record<string, PipCheckpointReportSummary>> {
  const { data: rows, error } = await supabase
    .from('user_context_events')
    .select('payload, created_at')
    .eq('user_id', userId)
    .eq('source', 'pip')
    .eq('kind', 'checkpoint_graded')
    .order('created_at', { ascending: false })
    .limit(120)

  if (error || !rows?.length) return {}

  const out: Record<string, PipCheckpointReportSummary> = {}
  for (const row of rows) {
    const p = payloadRecord(row.payload)
    if (!p || p.roadmap_id !== roadmapId || p.roadmap_mode !== roadmapMode) continue

    const milestoneRaw = typeof p.milestone_id === 'string' ? p.milestone_id : ''
    const week =
      typeof p.week === 'number'
        ? p.week
        : parseWeekNumberFromMilestoneId(milestoneRaw)
    if (week == null || week < 1) continue

    const milestone_id = canonicalMilestoneId(week)
    if (out[milestone_id]) continue

    out[milestone_id] = {
      milestone_id,
      week,
      score_percent: typeof p.score_percent === 'number' ? p.score_percent : 0,
      submitted_at: row.created_at,
      xp_delta: typeof p.xp_delta === 'number' ? p.xp_delta : null,
    }
  }
  return out
}

export async function fetchPipCheckpointReportForMilestone(
  supabase: SupabaseClient,
  userId: string,
  roadmapId: string,
  roadmapMode: 'skills' | 'job_ready',
  milestoneId: string,
): Promise<PipCheckpointReportDetail | null> {
  const week = parseWeekNumberFromMilestoneId(milestoneId)
  if (week == null || week < 1) return null
  const canonical = canonicalMilestoneId(week)

  const { data: rows, error } = await supabase
    .from('user_context_events')
    .select('payload, created_at')
    .eq('user_id', userId)
    .eq('source', 'pip')
    .eq('kind', 'checkpoint_graded')
    .order('created_at', { ascending: false })
    .limit(120)

  if (error || !rows?.length) return null

  for (const row of rows) {
    const p = payloadRecord(row.payload)
    if (!p || p.roadmap_id !== roadmapId || p.roadmap_mode !== roadmapMode) continue

    const detail = reportFromPayload(row, roadmapMode)
    if (detail?.milestone_id === canonical) return detail
  }
  return null
}
