"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  AlertCircleIcon,
  ArrowRight01Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = React.useState(false);

  // If already logged in, allow quick continue or switch
  if (!isSessionLoading && session?.user) {
    return (
      <Card className="w-full border-border/80 bg-card/90 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />
          </div>
          <CardTitle className="text-2xl">Already Signed In</CardTitle>
          <CardDescription>
            You are signed in as{" "}
            <span className="font-semibold text-foreground">
              {session.user.name || session.user.email}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-center text-xs text-muted-foreground">
            {session.user.email}
          </div>
          <Button
            type="button"
            className="w-full gap-2 rounded-2xl"
            onClick={() => router.push(callbackUrl)}
          >
            <span>Continue to App</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl"
            onClick={async () => {
              await authClient.signOut();
              router.refresh();
            }}
          >
            Sign out & switch account
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic validation
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res.error) {
        // Human-friendly error messages
        const msg = res.error.message?.toLowerCase() || "";
        if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("password")) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (msg.includes("not found")) {
          setErrorMessage("No account found with this email. Would you like to create one?");
        } else {
          setErrorMessage(res.error.message || "Failed to sign in. Please check your credentials.");
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-border/70 bg-card/95 shadow-xl backdrop-blur-md transition-all">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <div className="flex justify-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Welcome back
          </span>
        </div>
        <CardTitle className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Sign In
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in duration-200">
            <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="rounded p-0.5 opacity-70 hover:opacity-100"
              aria-label="Dismiss error"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </button>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-200">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forgot password inline info */}
        {forgotPasswordNotice && (
          <div className="flex items-start justify-between rounded-2xl border border-border bg-muted/60 p-3 text-xs text-muted-foreground animate-in fade-in duration-200">
            <p>
              To reset your password, contact your administrator or register a new local dev account.
            </p>
            <button
              type="button"
              onClick={() => setForgotPasswordNotice(false)}
              className="ml-2 font-medium text-foreground hover:underline"
            >
              Got it
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={Mail01Icon} className="size-4" />
              </span>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="pl-10 h-11 rounded-2xl bg-muted/30 focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="login-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </Label>
              <button
                type="button"
                onClick={() => setForgotPasswordNotice(true)}
                className="text-xs font-medium text-primary hover:underline transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
              </span>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="pl-10 pr-10 h-11 rounded-2xl bg-muted/30 focus-visible:bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading}
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-2xl font-medium gap-2 text-sm shadow-md transition-all active:scale-[0.99]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pb-6 pt-2">
        <div className="relative w-full">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            New to Finci?
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
