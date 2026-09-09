'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  STUDY_ROOM_SLUGS,
  STUDY_ROOMS,
  resolveStudyRoom,
  type StudyRoomSlug,
} from '@/lib/config/studyRooms'

export function StudyRoomExperience() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roomParam = searchParams.get('room')
  const { slug, room } = resolveStudyRoom(roomParam)

  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    setIframeLoaded(false)
  }, [room.frameUrl])

  const selectRoom = useCallback(
    (next: StudyRoomSlug) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('room', next)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{room.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{room.description}</p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Study room switcher"
      >
        {STUDY_ROOM_SLUGS.map((key) => {
          const item = STUDY_ROOMS[key]
          const active = key === slug
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectRoom(key)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.title}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={room.frameUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Open in new tab
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          Use this if the embed is blocked or microphone access fails inside the iframe.
        </p>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/30">
        {!iframeLoaded ? (
          <div
            className="absolute inset-0 z-10 flex min-h-[85vh] flex-col items-center justify-center gap-3 bg-muted/80"
            aria-busy="true"
            aria-live="polite"
          >
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading study room…</p>
          </div>
        ) : null}
        <iframe
          key={room.frameUrl}
          src={room.frameUrl}
          title={`${room.title} — Frame space`}
          allow="camera; microphone; display-capture; xr-spatial-tracking; fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIframeLoaded(true)}
          className="h-[85vh] w-full rounded-xl border-0 bg-background"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Rooms are hosted by Frame. Content inside each space is curated manually.{' '}
        <Link href="/dashboard" className="underline underline-offset-2 hover:text-foreground">
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}
