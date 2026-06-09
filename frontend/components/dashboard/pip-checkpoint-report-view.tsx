'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PipCheckpointReportDetail } from '@/lib/pip-checkpoint-report'
import { CheckCircle2, XCircle } from 'lucide-react'

type QuestionRow = {
  id: string
  kind?: string
  prompt?: string
  topic?: string
  choices?: string[]
  difficulty?: string
}

export function PipCheckpointReportView({ report }: { report: PipCheckpointReportDetail }) {
  const questions = (
    Array.isArray(report.assessment?.questions) ? report.assessment.questions : []
  ) as QuestionRow[]

  const resultById = new Map(
    (report.graded.results || []).map((r) => [String(r.question_id || ''), r]),
  )
  const xpById = new Map(
    (report.xp?.per_question || []).map((r) => [String(r.question_id || ''), r]),
  )

  return (
    <div className="space-y-5">
      <div
        className={cn(
          'rounded-xl border p-4 text-center',
          report.score_percent >= 70 ? 'border-chart-2/40 bg-chart-2/10' : 'border-border bg-muted/30',
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Score</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{report.score_percent}%</p>
        {typeof report.xp?.net === 'number' ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Total XP from this quiz:{' '}
            <span className="font-semibold text-foreground">
              {report.xp.net >= 0 ? '+' : ''}
              {report.xp.net}
            </span>
          </p>
        ) : null}
        {report.submitted_at ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Submitted {new Date(report.submitted_at).toLocaleString()}
          </p>
        ) : null}
      </div>

      {report.weak_topics.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Topics to review</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.weak_topics.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {report.pip_summary_for_archie?.trim() ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Pip summary</p>
          <p className="mt-1 leading-relaxed">{report.pip_summary_for_archie.trim()}</p>
        </div>
      ) : null}

      {Array.isArray(report.flashcard_suggestions) && report.flashcard_suggestions.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested flashcards</p>
          <ul className="mt-2 space-y-2">
            {report.flashcard_suggestions.slice(0, 8).map((fc, i) => (
              <li
                key={i}
                className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs"
              >
                <span className="font-medium text-foreground">{fc.front}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-muted-foreground">{fc.back}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Questions &amp; your answers
        </p>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No question details stored for this attempt.</p>
        ) : (
          questions.map((q, idx) => {
            const qid = String(q.id || '')
            const gr = resultById.get(qid)
            const pq = xpById.get(qid)
            const ans = report.answers[qid]
            const kind = (q.kind || 'mcq').toLowerCase()
            const isMcq = (kind === 'mcq' || kind === '') && Array.isArray(q.choices) && q.choices.length >= 2
            const correct = gr?.correct === true

            return (
              <div
                key={qid || idx}
                className="rounded-lg border border-border/70 bg-card/80 p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-start gap-2">
                  {correct ? (
                    <CheckCircle2 className="size-4 shrink-0 text-chart-2" aria-hidden />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Q{idx + 1}</span>
                      {q.topic ? (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {q.topic}
                        </Badge>
                      ) : null}
                      {pq ? (
                        <Badge variant="secondary" className="text-[10px] tabular-nums">
                          {pq.xp >= 0 ? '+' : ''}
                          {pq.xp} XP
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{q.prompt || 'Question'}</p>
                    {isMcq && q.choices ? (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {q.choices.map((choice, ci) => {
                          const picked = ans?.mcq_index === ci
                          return (
                            <li
                              key={ci}
                              className={cn(
                                'rounded-md px-2 py-1',
                                picked && 'bg-pip/10 font-medium text-foreground ring-1 ring-pip/30',
                              )}
                            >
                              {ci + 1}. {choice}
                              {picked ? ' (your answer)' : ''}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <pre className="max-h-40 overflow-auto rounded-md bg-muted/40 p-2 text-xs whitespace-pre-wrap">
                        {(ans?.text || '').trim() || '(no answer recorded)'}
                      </pre>
                    )}
                    {gr?.note ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">Pip: </span>
                        {gr.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
