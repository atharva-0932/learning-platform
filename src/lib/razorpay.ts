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
 * - `RAZORPAY_KEY_ID` — Same Key ID as in the dashboard; use if you prefer not to duplicate as `NEXT_PUBLIC_*` (server-only code can read this; browser Checkout still needs the public copy or a server-passed value).
 * - `RAZORPAY_KEY_SECRET` — For Orders API, payment verification, webhooks.
 * - `RAZORPAY_WEBHOOK_SECRET` — For verifying webhook signatures.
 *
 * Subscribe CTAs in the app should route to {@link PAYMENTS_PATH} first; that page then links to Razorpay.
 */

/** In-app route where users complete payment (Razorpay opens from there). */
export const PAYMENTS_PATH = "/payments";

/**
 * Direct Razorpay Payment Page / hosted URL (no fallback). Used on `/payments` for the final “Pay” button.
 */
export function getRazorpayExternalPaymentUrl(): string | undefined {
  const u =
    process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK ||
    process.env.NEXT_PUBLIC_RAZORPAY_SUBSCRIPTION_LINK ||
    process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_URL;
  const trimmed = u?.trim();
  return trimmed || undefined;
}

/** Key ID for Razorpay Checkout (prefers public env, then server `RAZORPAY_KEY_ID`). */
export function getRazorpayKeyId(): string | undefined {
  const pub = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const server = process.env.RAZORPAY_KEY_ID?.trim();
  return pub || server || undefined;
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
