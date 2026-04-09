import type { Metadata } from "next";
import RuixenPricing04 from "@/components/ui/ruixen-pricing-04";
import { getRazorpaySubscribeUrl } from "@/lib/razorpay";

export const metadata: Metadata = {
  title: "Pricing | SKILLSPHERE",
  description:
    "SKILLSPHERE Pro — unlock detailed interview reports, AI job discovery, and full career intelligence.",
};

export default function PricingPage() {
  const proCheckoutUrl = getRazorpaySubscribeUrl("/signup");

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <RuixenPricing04 proCheckoutUrl={proCheckoutUrl} signupPath="/signup" />
      </div>
      <p className="mx-auto max-w-2xl px-4 pb-12 text-center text-sm text-muted-foreground">
        Prices shown are examples—your Razorpay checkout or payment page may show the live amount for your
        region. Use the same email as your SKILLSPHERE account so your subscription links to your profile.
      </p>
    </div>
  );
}
