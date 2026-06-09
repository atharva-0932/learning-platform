import { createClient } from '@/lib/supabase/server'
import { getJobReadyPortalAmountPaise } from '@/lib/server/razorpay'
import { isJobReadyPortalUnlocked } from '@/lib/server/job-ready-portal-access'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unlocked = await isJobReadyPortalUnlocked(supabase, user.id)
    const amountPaise = getJobReadyPortalAmountPaise()

    return NextResponse.json({
      unlocked,
      amount_paise: amountPaise,
      amount_inr: amountPaise / 100,
      currency: 'INR',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
