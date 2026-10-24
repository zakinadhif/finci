import * as React from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account - Finci",
  description: "Create a new Finci account and start managing your finances.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <React.Suspense
        fallback={
          <div className="flex h-96 w-full items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <RegisterForm />
      </React.Suspense>
    </AuthLayout>
  );
}
