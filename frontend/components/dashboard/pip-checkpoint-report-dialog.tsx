'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PipCheckpointReportView } from '@/components/dashboard/pip-checkpoint-report-view'
import type { PipCheckpointReportDetail } from '@/lib/pip-checkpoint-report'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PipCheckpointReportDialog({
  open,
  onOpenChange,
  roadmapId,
  roadmapMode,
  milestoneId,
  milestoneTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadmapId: string | null | undefined
  roadmapMode: 'skills' | 'job_ready'
  milestoneId: string | null
  milestoneTitle?: string
}) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<PipCheckpointReportDetail | null>(null)

  useEffect(() => {
    if (!open || !roadmapId || !milestoneId) {
      setReport(null)
      return
    }

    const ctrl = new AbortController()
    setLoading(true)
    setReport(null)

    void (async () => {
      try {
        const qs = new URLSearchParams({
          roadmap_mode: roadmapMode,
          milestone_id: milestoneId,
        })
        const res = await fetch(
          `/api/learning-roadmaps/${encodeURIComponent(roadmapId)}/checkpoint/report?${qs}`,
          { credentials: 'include', signal: ctrl.signal },
        )
        const data = (await res.json()) as { report?: PipCheckpointReportDetail; error?: string }
        if (!res.ok) throw new Error(data.error || 'Could not load report')
        setReport(data.report ?? null)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        toast.error(e instanceof Error ? e.message : 'Could not load report')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    })()

    return () => ctrl.abort()
  }, [open, roadmapId, roadmapMode, milestoneId, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border/80 px-4 py-4 sm:px-6">
          <DialogTitle>Pip assessment report</DialogTitle>
          <DialogDescription>
            {milestoneTitle ? `${milestoneTitle} · ` : ''}
            {milestoneId || 'Checkpoint'}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Loading report…
            </div>
          ) : report ? (
            <PipCheckpointReportView report={report} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No report found for this milestone.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
