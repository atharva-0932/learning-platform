"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              SKILL<span className="text-primary">SPHERE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <Link href="/dashboard" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Login
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
