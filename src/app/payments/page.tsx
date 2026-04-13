import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRazorpayExternalPaymentUrl } from "@/lib/razorpay";

export const metadata: Metadata = {
  title: "Payments | SKILLSPHERE",
  description: "Complete your SKILLSPHERE Pro subscription securely with Razorpay.",
};

export default function PaymentsPage() {
  const razorpayUrl = getRazorpayExternalPaymentUrl();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
          <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-muted-foreground" asChild>
            <Link href="/pricing">
              <ArrowLeft className="size-4" aria-hidden />
              Back to pricing
            </Link>
          </Button>

          <div className="mb-6 flex items-center gap-2">
            <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="mr-1 size-3" aria-hidden />
              Pro
            </Badge>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Complete your payment
          </h1>
          <p className="mt-3 text-muted-foreground">
            You&apos;ll be redirected to Razorpay&apos;s secure checkout. Use the same email as your SKILLSPHERE
            account so we can activate Pro on your profile.
          </p>

          <Card className="mt-8 border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5 text-primary" aria-hidden />
                Razorpay
              </CardTitle>
              <CardDescription>
                Test or live mode depends on your Razorpay dashboard keys. Cards and UPI supported per your Razorpay
                settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {razorpayUrl ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    When you continue, you leave SKILLSPHERE and complete payment on Razorpay. After a successful
                    payment, return here or open the dashboard.
                  </p>
                  <Button size="lg" className="w-full" asChild>
                    <a href={razorpayUrl} target="_blank" rel="noopener noreferrer">
                      Continue to Razorpay
                    </a>
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Payment link not configured</p>
                  <p className="mt-2">
                    Add{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                      NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK
                    </code>{" "}
                    in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code> (Payment Page URL
                    from the Razorpay Dashboard), then restart the dev server.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/signup">Create account</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
