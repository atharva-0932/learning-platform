export type PipCheckpointReportSummary = {
  milestone_id: string
  week: number | null
  score_percent: number
  submitted_at: string
  xp_delta: number | null
}

export type PipCheckpointReportDetail = {
  milestone_id: string
  week: number | null
  roadmap_mode: 'skills' | 'job_ready'
  roadmap_title: string | null
  submitted_at: string
  score_percent: number
  weak_topics: string[]
  pip_summary_for_archie: string | null
  flashcard_suggestions: { front?: string; back?: string; from_question_id?: string }[]
  assessment: Record<string, unknown>
  answers: Record<string, { mcq_index?: number; text?: string }>
  graded: {
    results?: {
      question_id?: string
      correct?: boolean
      topic?: string
      difficulty?: string
      kind?: string
      note?: string
    }[]
    score_percent?: number
    weak_topics?: string[]
    pip_summary_for_archie?: string
    flashcard_suggestions?: { front?: string; back?: string; from_question_id?: string }[]
  }
  xp: {
    gained?: number
    lost?: number
    net?: number
    quiz_net?: number
    score_bonus?: number
    pip_completion?: number
    previous?: number
    next?: number
    per_question?: Array<{ question_id: string; correct: boolean; difficulty: string; xp: number }>
  } | null
}

export function resolveQuizNotificationEmail(opts: {
  quizNotificationEmail?: string | null
  authEmail?: string | null
}): string {
  const override = (opts.quizNotificationEmail || '').trim()
  if (override && override.includes('@')) return override
  const auth = (opts.authEmail || '').trim()
  if (auth && auth.includes('@')) return auth
  return ''
}
