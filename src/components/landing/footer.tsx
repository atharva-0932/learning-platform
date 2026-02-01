import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">
              SKILL<span className="text-primary">SPHERE</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 SKILLSPHERE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
