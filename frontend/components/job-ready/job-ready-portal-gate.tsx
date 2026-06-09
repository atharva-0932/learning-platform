'use client'

import { useCallback, useEffect, useState } from 'react'
import Script from 'next/script'
import { Loader2, Lock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RazorpayHandlerResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  handler: (response: RazorpayHandlerResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

type StatusResponse = {
  unlocked: boolean
  amount_paise: number
  amount_inr: number
  currency: string
}

function formatInr(amountInr: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr)
}

export function JobReadyPortalGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [paying, setPaying] = useState(false)
  const [amountInr, setAmountInr] = useState(499)
  const [scriptReady, setScriptReady] = useState(false)

  const refreshStatus = useCallback(async () => {
    const res = await fetch('/api/payments/job-ready-status', { credentials: 'include' })
    if (!res.ok) {
      throw new Error('Could not load payment status')
    }
    const data = (await res.json()) as StatusResponse
    setUnlocked(!!data.unlocked)
    if (typeof data.amount_inr === 'number') {
      setAmountInr(data.amount_inr)
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
      .catch((e) => {
        console.error(e)
        toast.error(e instanceof Error ? e.message : 'Failed to load portal status')
      })
      .finally(() => setLoading(false))
  }, [refreshStatus])

  const startCheckout = async () => {
    if (!scriptReady || !window.Razorpay) {
      toast.error('Payment checkout is still loading. Please try again.')
      return
    }

    setPaying(true)
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'job_ready_portal' }),
      })

      const orderBody = (await orderRes.json()) as {
        error?: string
        order_id?: string
        amount?: number
        currency?: string
        key_id?: string
      }

      if (!orderRes.ok) {
        throw new Error(orderBody.error || 'Failed to create order')
      }

      const { order_id, amount, currency, key_id } = orderBody
      if (!order_id || !amount || !currency || !key_id) {
        throw new Error('Invalid order response from server')
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: key_id,
          amount,
          currency,
          name: 'SkillCrew',
          description: 'Unlock Job Ready portal',
          order_id,
          theme: { color: '#6366f1' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              })
              const verifyBody = (await verifyRes.json()) as { error?: string; success?: boolean }
              if (!verifyRes.ok || !verifyBody.success) {
                throw new Error(verifyBody.error || 'Payment verification failed')
              }
              toast.success('Payment successful — Job Ready portal unlocked!')
              setUnlocked(true)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled'))
            },
          },
        })

        rzp.on('payment.failed', (response) => {
          reject(new Error(response.error?.description || 'Payment failed'))
        })

        rzp.open()
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Checkout failed'
      if (message !== 'Payment cancelled') {
        toast.error(message)
      }
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
        onError={() => toast.error('Failed to load Razorpay checkout')}
      />

      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <Card className="w-full max-w-lg border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="size-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Unlock Job Ready portal</CardTitle>
            <CardDescription>
              One-time access to company research, live mock interviews, and curated job openings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                GeeksforGeeks + Glassdoor company interview intel
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                Voice mock interview with coaching report
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                Fresh job listings matched to your target role
              </li>
            </ul>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">One-time unlock</p>
              <p className="text-3xl font-bold">{formatInr(amountInr)}</p>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={paying || !scriptReady}
              onClick={() => void startCheckout()}
            >
              {paying ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing…
                </>
              ) : !scriptReady ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading checkout…
                </>
              ) : (
                `Pay ${formatInr(amountInr)} & unlock`
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Secure checkout powered by Razorpay. Test mode uses Razorpay test cards.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
