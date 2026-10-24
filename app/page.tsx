import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BankIcon,
  Shield01Icon,
  ArrowRight01Icon,
  LockPasswordIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

const links = [
  {
    href: "https://github.com/cloudflare/vinext",
    label: "vinext",
  },
  {
    href: "https://developers.cloudflare.com/workers/",
    label: "Workers",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HugeiconsIcon icon={BankIcon} className="size-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-tight">Finci</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-6 py-12">
        <section className="mx-auto flex max-w-5xl flex-col gap-10">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-4xl border border-border/80 bg-gradient-to-b from-card/90 to-card/50 p-8 shadow-sm sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs">
                  <HugeiconsIcon icon={Shield01Icon} className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Better-Auth Enabled</span>
                </Badge>
                <span className="text-xs text-muted-foreground">Cloudflare D1 Native</span>
              </div>

              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                Secure & Fast <br />
                Authentication
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
                Explore the register and login flows powered by Better-Auth, Cloudflare D1, and Base UI components with full responsive support.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "rounded-2xl gap-2 shadow-md"
                  )}
                >
                  <HugeiconsIcon icon={UserIcon} className="size-4" />
                  <span>Create Account</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Link>

                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-2xl gap-2"
                  )}
                >
                  <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Auth Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border-border/80 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                  <HugeiconsIcon icon={LockPasswordIcon} className="size-5" />
                </div>
                <CardTitle className="text-lg">Sign In Page</CardTitle>
                <CardDescription>
                  Email & password authentication, &quot;Remember me&quot; cookie support, instant feedback, and clean error handling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Go to Login page</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/80 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                  <HugeiconsIcon icon={UserIcon} className="size-5" />
                </div>
                <CardTitle className="text-lg">Register Page</CardTitle>
                <CardDescription>
                  Full name, email, live password strength meter with criteria checks, password confirmation validation, and terms agreement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Go to Register page</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Dev / Stack info */}
          <div className="rounded-3xl border border-border/60 bg-muted/30 p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Architecture
            </h2>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="font-semibold block text-foreground">Stack</span>
                <span className="text-xs text-muted-foreground mt-1 block">vinext + Next.js App Router + Vite + Tailwind CSS</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="font-semibold block text-foreground">Auth & Database</span>
                <span className="text-xs text-muted-foreground mt-1 block">Better-Auth v1.7 + Cloudflare D1 Native + SQLite</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="font-semibold block text-foreground">Design System</span>
                <span className="text-xs text-muted-foreground mt-1 block">Base UI Primitives + Hugeicons + OKLCH Theme</span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 pt-2">
              {links.map((link) => (
                <a
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
              <a
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                href="/api/hello"
              >
                API: /api/hello
              </a>
            </nav>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span>Finci • Next-Gen Financial Platform</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
