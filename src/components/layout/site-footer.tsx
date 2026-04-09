"use client";

import { FooterOne } from "@/components/ui/footer-1";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <FooterOne
      logo={<Sparkles className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />}
      brandName="SKILLSPHERE"
      tagline="AI-powered career guidance, resume intelligence, and interview practice."
      copyright={`© ${new Date().getFullYear()} SKILLSPHERE. All rights reserved.`}
      legalLinks={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Use" },
      ]}
    />
  );
}
