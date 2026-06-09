import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { JOB_READY_PORTAL_PRODUCT, verifyRazorpayPaymentSignature } from '@/lib/server/razorpay'
import { NextResponse } from 'next/server'

type Body = {
  razorpay_payment_id?: string
  razorpay_order_id?: string
  razorpay_signature?: string
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

    let body: Body
    try {
      body = (await request.json()) as Body
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const paymentId = (body.razorpay_payment_id || '').trim()
    const orderId = (body.razorpay_order_id || '').trim()
    const signature = (body.razorpay_signature || '').trim()

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: 'razorpay_payment_id, razorpay_order_id, and razorpay_signature are required' },
        { status: 400 },
      )
    }

    const valid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    })

    if (!valid) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    if (!admin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }

    const { data: orderRow, error: orderError } = await admin
      .from('razorpay_orders')
      .select('id, user_id, status, product')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (orderError) {
      console.error('[verify-payment] order lookup failed:', orderError.message)
      return NextResponse.json({ error: 'Failed to verify order' }, { status: 500 })
    }

    if (!orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (orderRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Order does not belong to this user' }, { status: 403 })
    }

    if (orderRow.product !== JOB_READY_PORTAL_PRODUCT) {
      return NextResponse.json({ error: 'Invalid order product' }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (orderRow.status === 'paid') {
      return NextResponse.json({ success: true, already_verified: true })
    }

    const { error: orderUpdateError } = await admin
      .from('razorpay_orders')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        paid_at: now,
      })
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)

    if (orderUpdateError) {
      console.error('[verify-payment] order update failed:', orderUpdateError.message)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        job_ready_portal_unlocked_at: now,
        updated_at: now,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('[verify-payment] profile unlock failed:', profileError.message)
      return NextResponse.json({ error: 'Payment verified but unlock failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
