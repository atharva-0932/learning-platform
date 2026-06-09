import crypto from 'crypto'

import Razorpay from 'razorpay'

export const JOB_READY_PORTAL_PRODUCT = 'job_ready_portal'

export function getRazorpayKeyId(): string {
  return (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim()
}

export function getRazorpayKeySecret(): string {
  return (process.env.RAZORPAY_KEY_SECRET || '').trim()
}

export function getJobReadyPortalAmountPaise(): number {
  const raw = (process.env.JOB_READY_PORTAL_AMOUNT_PAISE || '49900').trim()
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 100 ? n : 49900
}

export function getRazorpayClient(): Razorpay {
  const key_id = getRazorpayKeyId()
  const key_secret = getRazorpayKeySecret()
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured')
  }
  return new Razorpay({ key_id, key_secret })
}

export function verifyRazorpayPaymentSignature(opts: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const secret = getRazorpayKeySecret()
  if (!secret) return false
  const body = `${opts.orderId}|${opts.paymentId}`
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(opts.signature))
  } catch {
    return false
  }
}

export function isRazorpayAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const status = (err as { statusCode?: number }).statusCode
  return status === 401 || status === 403
}
