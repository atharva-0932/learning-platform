import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import {
  getJobReadyPortalAmountPaise,
  getRazorpayClient,
  isRazorpayAuthError,
  JOB_READY_PORTAL_PRODUCT,
} from '@/lib/server/razorpay'
import { isJobReadyPortalUnlocked } from '@/lib/server/job-ready-portal-access'
import { NextResponse } from 'next/server'

type Body = {
  amount?: number
  currency?: string
  receipt?: string
  product?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (await isJobReadyPortalUnlocked(supabase, user.id)) {
      return NextResponse.json({ error: 'Job Ready portal is already unlocked' }, { status: 400 })
    }

    let body: Body = {}
    try {
      body = (await request.json()) as Body
    } catch {
      body = {}
    }

    const product = (body.product || JOB_READY_PORTAL_PRODUCT).trim() || JOB_READY_PORTAL_PRODUCT
    if (product !== JOB_READY_PORTAL_PRODUCT) {
      return NextResponse.json({ error: 'Unsupported product' }, { status: 400 })
    }

    const amount = typeof body.amount === 'number' ? Math.round(body.amount) : getJobReadyPortalAmountPaise()
    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json({ error: 'amount must be at least 100 paise' }, { status: 400 })
    }

    const serverAmount = getJobReadyPortalAmountPaise()
    if (amount !== serverAmount) {
      return NextResponse.json(
        { error: `Invalid amount. Expected ${serverAmount} paise for Job Ready portal.` },
        { status: 400 },
      )
    }

    const currency = (body.currency || 'INR').trim().toUpperCase()
    if (currency !== 'INR') {
      return NextResponse.json({ error: 'Only INR is supported' }, { status: 400 })
    }

    const receipt =
      (body.receipt || `job_ready_${user.id.slice(0, 8)}_${Date.now()}`).slice(0, 40)

    let order: { id: string; amount: number; currency: string }
    try {
      const razorpay = getRazorpayClient()
      order = (await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes: {
          user_id: user.id,
          product,
        },
      })) as { id: string; amount: number; currency: string }
    } catch (err) {
      console.error('[create-order] Razorpay error:', err)
      if (isRazorpayAuthError(err)) {
        return NextResponse.json({ error: 'Razorpay authentication failed' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
    }

    const admin = createServiceRoleClient()
    if (!admin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }

    const { error: insertError } = await admin.from('razorpay_orders').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount_paise: amount,
      currency,
      receipt,
      status: 'created',
      product,
    })

    if (insertError) {
      console.error('[create-order] DB insert failed:', insertError.message)
      return NextResponse.json({ error: 'Failed to persist order' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Internal server error'
    if (message.includes('not configured')) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
