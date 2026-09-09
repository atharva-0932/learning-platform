'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain } from 'lucide-react'

/**
 * Revision Lab — lightweight review hub.
 * (Previous file mistakenly duplicated ArchieGamifiedRoadmap without a default export.)
 */
export default function RevisionLabPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Revision Lab</h1>
        <p className="text-sm text-muted-foreground">
          Revisit weak topics from Pip checkpoints and join the review study room when you want a shared space.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review study room</CardTitle>
          <CardDescription>
            Open the Frame review space for quiet quiz prep. Room content is curated manually in Frame.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/study-room?room=review">Study room →</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <Brain className="size-3.5" />
              Back to Command Center
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/progress">
              <BookOpen className="size-3.5" />
              Progress
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
