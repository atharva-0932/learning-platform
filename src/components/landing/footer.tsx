"use client";

import Link from "next/link";
import { Sparkles, Github, Linkedin, Twitter } from "lucide-react";

const productLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Career Roadmap", href: "/dashboard/career" },
  { label: "Resume Studio", href: "/dashboard/resume" },
  { label: "Job Ready", href: "/dashboard/job-ready" },
  { label: "Pricing", href: "/pricing" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
];

const socialLinks = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "Twitter / X", href: "#", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-background">
      {/* Top separator glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-bold text-foreground">
                SKILL<span className="text-primary">SPHERE</span>
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              AI-powered career guidance, resume intelligence, and interview
              practice — in one platform.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-foreground">
              Product
            </p>
            <ul className="space-y-3">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-foreground">
              Company
            </p>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-foreground">
              Get started
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Free to use. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SKILLSPHERE. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <span className="text-primary">Next.js</span>,{" "}
            <span className="text-primary">Supabase</span> &amp; AI
          </p>
        </div>
      </div>
    </footer>
  );
}
