"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  ArrowRight01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="size-8 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    );
  }

  if (session?.user) {
    const initials = (session.user.name || session.user.email || "U")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-xs">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex flex-col text-left leading-none pr-1">
            <span className="text-xs font-semibold text-foreground">
              {session.user.name || "User"}
            </span>
            <span className="text-[10px] text-muted-foreground max-w-[120px] truncate">
              {session.user.email}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-full text-xs"
        >
          {isSigningOut ? (
            <HugeiconsIcon icon={Loading03Icon} className="size-3 animate-spin" />
          ) : (
            "Sign Out"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs")}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "rounded-full text-xs gap-1.5 shadow-xs"
        )}
      >
        <span>Create Account</span>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
      </Link>
    </div>
  );
}
