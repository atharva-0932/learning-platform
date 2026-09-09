'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { QRCodeCard } from '@/components/study-room/qr-code-card'

function isAllowedQrUrl(raw: string, origin: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('https://')) return true
  if (origin && trimmed.startsWith(origin)) return true
  return false
}

function QrPageInner() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url') ?? ''
  const label = searchParams.get('label') ?? undefined

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const allowed = useMemo(() => isAllowedQrUrl(urlParam, origin), [urlParam, origin])

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center text-neutral-800">
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-semibold">Invalid QR URL</h1>
          <p className="text-sm text-neutral-600">
            The <code className="rounded bg-neutral-100 px-1">url</code> query param must start with this
            app&apos;s origin or <code className="rounded bg-neutral-100 px-1">https://</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8">
      <QRCodeCard url={urlParam.trim()} label={label ?? undefined} size={512} />
    </div>
  )
}

export default function StudyRoomQrPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
          Loading…
        </div>
      }
    >
      <QrPageInner />
    </Suspense>
  )
}
