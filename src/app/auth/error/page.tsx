"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There's a server configuration error. Please contact support.",
  AccessDenied: "You don't have permission to access this resource.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An authentication error occurred. Please try signing in again.",
  CredentialsSignin: "Invalid email or password. Please check your credentials.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl border border-border shadow-warm-lg p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-primary mb-3">Authentication Error</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signin"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all shadow-warm">
            Try Signing In Again
          </Link>
          <Link href="/"
            className="flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md text-center p-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
