'use client'

import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

type QRCodeCardProps = {
  url: string
  label?: string
  className?: string
  /** Pixel size of the QR SVG (default 512 for screenshot/export). */
  size?: number
}

export function QRCodeCard({ url, label, className, size = 512 }: QRCodeCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-8 text-neutral-900 shadow-sm',
        className,
      )}
    >
      <QRCodeSVG value={url} size={size} level="M" includeMargin bgColor="#ffffff" fgColor="#0a0a0a" />
      {label ? (
        <p className="max-w-[512px] text-center text-base font-medium leading-snug">{label}</p>
      ) : null}
      <p className="max-w-[512px] break-all text-center text-xs text-neutral-500">{url}</p>
    </div>
  )
}
