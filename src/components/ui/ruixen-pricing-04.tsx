"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type BillPlan = "monthly" | "annually";

export type SkillspherePlan = {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number;
  annuallyPrice: number;
  badge?: string;
  buttonText: string;
  features: string[];
};

export const SKILLSPHERE_PLANS: SkillspherePlan[] = [
  {
    id: "starter",
    title: "Starter",
    desc: "For learners who want AI career guidance, practice interviews, and roadmap basics—no card required.",
    monthlyPrice: 0,
    annuallyPrice: 0,
    buttonText: "Get started free",
    features: [
      "Dashboard, profile & skills view",
      "Voice mock interviews (practice mode)",
      "Career roadmap & recommender (core)",
      "High-level session summary after interviews",
      "Resume upload & structured profile basics",
    ],
  },
  {
    id: "pro",
    title: "Pro",
    desc: "For serious job seekers who want full analytics, AI-ranked jobs, and premium tools across SKILLSPHERE.",
    monthlyPrice: 19,
    annuallyPrice: 190,
    badge: "Best value",
    buttonText: "Subscribe to Pro",
    features: [
      "Full interview performance report & metrics",
      "AI job discovery from top portals, ranked to your skills",
      "Advanced roadmap & personalized learning paths",
      "Resume intelligence across the dashboard",
      "Smart follow-up & application tracking",
      "Early access to new beta features",
    ],
  },
];

type Pricing04Props = {
  /** Razorpay Payment Page / Payment Link URL, or internal path */
  proCheckoutUrl: string;
  signupPath?: string;
  className?: string;
};

export default function RuixenPricing04({
  proCheckoutUrl,
  signupPath = "/signup",
  className,
}: Pricing04Props) {
  const [billPlan, setBillPlan] = useState<BillPlan>("monthly");

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex max-w-5xl flex-col items-center justify-center py-12 sm:py-16 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="mt-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Pricing
          </h2>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            One workspace for interviews, resumes, and job search—upgrade when you&apos;re ready for the full
            analytics suite.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-center space-x-4">
          <span className="text-base font-medium">Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={billPlan === "annually"}
            aria-label="Toggle annual billing"
            onClick={handleSwitch}
            className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="h-6 w-12 rounded-full bg-primary shadow-md shadow-black/10 transition-colors" />
            <div
              className={cn(
                "absolute left-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground transition-all duration-300 ease-in-out",
                billPlan === "annually" ? "translate-x-6" : "translate-x-0",
              )}
            />
          </button>
          <span className="text-base font-medium">Annually</span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 pt-8 sm:gap-6 lg:grid-cols-2 lg:pt-12">
        {SKILLSPHERE_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billPlan={billPlan}
            proCheckoutUrl={proCheckoutUrl}
            signupPath={signupPath}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  billPlan,
  proCheckoutUrl,
  signupPath,
}: {
  plan: SkillspherePlan;
  billPlan: BillPlan;
  proCheckoutUrl: string;
  signupPath: string;
}) {
  const isPro = plan.id === "pro";
  const price =
    billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice;
  const suffix = billPlan === "monthly" ? "/mo" : "/yr";

  const actionHref = isPro ? proCheckoutUrl : signupPath;
  const isExternal = isPro && (actionHref.startsWith("http") || actionHref.startsWith("//"));

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-start overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all lg:rounded-3xl",
        isPro && "border-primary/40 ring-1 ring-primary/25",
      )}
    >
      {isPro && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-12 w-full -rotate-45 rounded-2xl bg-primary/30 blur-[8rem] lg:rounded-3xl" />
      )}

      {plan.badge && (
        <div className="absolute right-4 top-4 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
          {plan.badge}
        </div>
      )}

      <div className="relative flex w-full flex-col items-start rounded-t-2xl p-4 md:p-8 lg:rounded-t-3xl">
        <h3 className="pt-5 text-xl font-medium text-foreground">{plan.title}</h3>
        <div className="mt-3 text-2xl font-bold tabular-nums md:text-5xl">
          <NumberFlow
            value={price}
            suffix={suffix}
            format={{
              style: "currency",
              currency: "USD",
              currencySign: "standard",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currencyDisplay: "narrowSymbol",
            }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{plan.desc}</p>
      </div>

      <div className="flex w-full flex-col items-start px-4 py-2 md:px-8">
        {isExternal ? (
          <Button size="lg" className="w-full" asChild>
            <a href={actionHref} target="_blank" rel="noopener noreferrer">
              {plan.buttonText}
            </a>
          </Button>
        ) : (
          <Button size="lg" className="w-full" asChild>
            <Link href={actionHref}>{plan.buttonText}</Link>
          </Button>
        )}
        <div className="mx-auto h-8 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${billPlan}-${price}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto mt-3 block text-center text-sm text-muted-foreground"
            >
              {billPlan === "monthly"
                ? "Billed monthly"
                : price === 0
                  ? "No charge — free tier"
                  : "Billed in one annual payment"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-4 ml-1 flex w-full flex-col items-start gap-y-2 p-5">
        <span className="mb-2 text-left text-base font-medium text-foreground">Includes</span>
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start justify-start gap-2">
            <div className="flex shrink-0 items-center justify-center pt-0.5">
              <CheckIcon className="size-5 text-primary" aria-hidden />
            </div>
            <span className="text-left text-sm leading-snug text-foreground/90">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
