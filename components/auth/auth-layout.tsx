"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Shield01Icon, BankIcon } from "@hugeicons/core-free-icons";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-background text-foreground">
      {/* Decorative ambient background gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-tr from-accent/20 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />
      </div>

      {/* Top navigation header */}
      <header className="w-full px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card transition-transform group-hover:-translate-x-0.5">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </span>
            <span>Back to home</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-semibold text-lg tracking-tight"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HugeiconsIcon icon={BankIcon} className="size-5" />
            </div>
            <span className="font-heading text-foreground font-bold tracking-tight">Finci</span>
          </Link>
        </div>
      </header>

      {/* Main card area */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Bank-grade 256-bit encryption</span>
          </div>
          <p>
            © {new Date().getFullYear()} Finci Inc. All rights reserved. •{" "}
            <a href="#terms" className="hover:underline">Terms</a> •{" "}
            <a href="#privacy" className="hover:underline">Privacy</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
