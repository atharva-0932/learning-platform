"use client";

import { FooterOne } from "@/components/ui/footer-1";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <FooterOne
      logo={<Sparkles className="h-8 w-8 text-white" aria-hidden />}
      brandName="SKILLSPHERE"
      tagline="Empowering learners and professionals with AI-powered career guidance, resume intelligence, and interview practice to accelerate growth."
      copyright={`© ${new Date().getFullYear()} SKILLSPHERE. All rights reserved.`}
      legalLinks={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Use" },
      ]}
    />
  );
}
