import * as React from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In - Finci",
  description: "Sign in to your Finci account to manage your finances.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <React.Suspense
        fallback={
          <div className="flex h-96 w-full items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </AuthLayout>
  );
}
