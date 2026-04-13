"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogOut, BadgeDollarSign } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/auth/actions";

export function Navbar({
  user,
  onSignupClick,
}: {
  user: unknown;
  onSignupClick?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              SKILL<span className="text-primary">SPHERE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <BadgeDollarSign className="h-3.5 w-3.5" aria-hidden />
                Pricing
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
                <form action={logout}>
                  <Button variant="outline" size="sm" className="gap-1.5 font-medium">
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                {onSignupClick ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#f59e0b] text-white hover:bg-[#f59e0b]/90 font-semibold px-5 glow-amber"
                    onClick={onSignupClick}
                  >
                    Get started free
                  </Button>
                ) : (
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-[#f59e0b] text-white hover:bg-[#f59e0b]/90 font-semibold px-5 glow-amber"
                    >
                      Get started free
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background md:hidden">
          <div className="space-y-2 px-6 py-4">
            <Link href="/pricing" className="block" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                <BadgeDollarSign className="h-4 w-4" aria-hidden />
                Pricing
              </Button>
            </Link>
            {user ? (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                    Dashboard
                  </Button>
                </Link>
                <form action={logout} className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 font-medium">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <Link href="/login" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                    Log in
                  </Button>
                </Link>
                {onSignupClick ? (
                  <Button
                    type="button"
                    className="w-full bg-[#f59e0b] font-semibold text-white hover:bg-[#f59e0b]/90"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignupClick();
                    }}
                  >
                    Get started free
                  </Button>
                ) : (
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-[#f59e0b] font-semibold text-white hover:bg-[#f59e0b]/90">
                      Get started free
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
