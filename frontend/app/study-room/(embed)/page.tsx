import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { StudyRoomExperience } from '@/components/study-room/study-room-experience'

function StudyRoomFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      Loading study rooms…
    </div>
  )
}

export default function StudyRoomPage() {
  return (
    <Suspense fallback={<StudyRoomFallback />}>
      <StudyRoomExperience />
    </Suspense>
  )
}
