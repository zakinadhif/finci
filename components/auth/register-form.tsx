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
  UserIcon,
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

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // If already logged in, offer continue or switch
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
            Sign out & create new account
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Password strength calculations
  const passwordCriteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number (0-9)", met: /\d/.test(password) },
    { label: "Uppercase & lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Special symbol (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = passwordCriteria.filter((c) => c.met).length;
  const strengthLevels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "bg-destructive",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ][Math.max(0, metCount - 1)] || "bg-muted";

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res.error) {
        const msg = res.error.message?.toLowerCase() || "";
        if (msg.includes("already exists") || msg.includes("duplicate") || msg.includes("registered")) {
          setErrorMessage("An account with this email already exists. Please sign in instead.");
        } else {
          setErrorMessage(res.error.message || "Failed to create account. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 700);
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
            Get started with Finci
          </span>
        </div>
        <CardTitle className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Create Account
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your details below to create your free account
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name field */}
          <div className="space-y-2">
            <Label htmlFor="register-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={UserIcon} className="size-4" />
              </span>
              <Input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                autoComplete="name"
                required
                disabled={isLoading}
                className="pl-10 h-11 rounded-2xl bg-muted/30 focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={Mail01Icon} className="size-4" />
              </span>
              <Input
                id="register-email"
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
            <Label
              htmlFor="register-password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
              </span>
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
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

            {/* Password strength visual meter */}
            {password.length > 0 && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Strength</span>
                  <span className="font-semibold text-foreground">
                    {metCount === 0 ? "Too weak" : strengthLevels[metCount - 1]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-colors ${
                        index < metCount ? strengthColor : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-muted-foreground">
                  {passwordCriteria.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 transition-colors ${
                        c.met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground/70"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${c.met ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="register-confirm-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm Password
              </Label>
              {passwordsMatch && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Passwords match
                </span>
              )}
              {passwordsMismatch && (
                <span className="text-[11px] font-medium text-destructive">
                  Passwords do not match
                </span>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
              </span>
              <Input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className={`pl-10 pr-10 h-11 rounded-2xl bg-muted/30 focus-visible:bg-background ${
                  passwordsMismatch ? "border-destructive ring-1 ring-destructive/30" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <HugeiconsIcon
                  icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="terms-checkbox"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-checkbox"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none"
            >
              I agree to the{" "}
              <a href="#terms" className="font-medium text-foreground hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="font-medium text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-2xl font-medium gap-2 text-sm shadow-md transition-all active:scale-[0.99]"
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
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
            Already registered?
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
