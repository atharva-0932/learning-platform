/**
 * Razorpay integration — payment links, Checkout, and subscriptions.
 *
 * **Browser-safe (NEXT_PUBLIC_*):**
 * - `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Key ID from Razorpay Dashboard (test/live). Used when you embed Razorpay Checkout on the client.
 * - `NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK` — Payment Page / Payment Link URL (primary “Subscribe” / “Pay” CTA).
 * - `NEXT_PUBLIC_RAZORPAY_SUBSCRIPTION_LINK` — Optional hosted subscription or plan link.
 * - `NEXT_PUBLIC_RAZORPAY_CHECKOUT_URL` — Optional fallback URL if you use a custom hosted page.
 *
 * **Server-only (never prefix with NEXT_PUBLIC_):**
 * - `RAZORPAY_KEY_SECRET` — For Orders API, payment verification, webhooks.
 * - `RAZORPAY_WEBHOOK_SECRET` — For verifying webhook signatures.
 *
 * Add keys to `.env.local` when ready. If no payment URL is set, callers pass a sensible fallback (e.g. `/pricing` or `/signup`).
 */

export function getRazorpaySubscribeUrl(fallback = "/pricing"): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK ||
    process.env.NEXT_PUBLIC_RAZORPAY_SUBSCRIPTION_LINK ||
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_URL ||
    fallback
  );
}

/** Public Key ID for future Razorpay Standard Checkout / embedded pay button. */
export function getRazorpayKeyId(): string | undefined {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || undefined;
}

type ProfileLike = Record<string, unknown> | null | undefined;

/** True if profile has a stored Razorpay (or legacy Stripe) customer/subscription id. */
export function hasPaymentProviderCustomer(profile: ProfileLike): boolean {
  if (!profile || typeof profile !== "object") return false;
  return Boolean(
    profile.razorpay_customer_id ||
      profile.razorpay_subscription_id ||
      profile.stripe_customer_id,
  );
}
