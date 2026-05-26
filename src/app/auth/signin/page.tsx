"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password. Please try again." });
        toast.error("Sign in failed", { description: "Check your credentials and try again." });
      } else {
        toast.success("Welcome back!", { description: "Signed in successfully." });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Quick fill for demo
  const quickFill = (type: "admin" | "buyer" | "seller") => {
    const credentials = {
      admin: { email: "admin@vendorhub.in", password: "Admin@123" },
      buyer: { email: "priya@example.com", password: "Buyer@123" },
      seller: { email: "ramesh@kirana.in", password: "Seller@123" },
    };
    setEmail(credentials[type].email);
    setPassword(credentials[type].password);
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass-premium rounded-3xl p-8 md:p-10 border border-white/60 shadow-warm-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent-dark mb-4">
            <Sparkles className="w-3 h-3" />
            Welcome back
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-accent font-semibold hover:text-accent-dark transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo Quick Fill */}
        <div className="mb-6 p-3 rounded-xl bg-warm-100 border border-warm-200">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            🚀 Demo accounts (click to fill)
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              { type: "admin" as const, label: "Admin", color: "bg-purple-100 text-purple-700 border-purple-200" },
              { type: "buyer" as const, label: "Buyer", color: "bg-blue-100 text-blue-700 border-blue-200" },
              { type: "seller" as const, label: "Seller", color: "bg-green-100 text-green-700 border-green-200" },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => quickFill(type)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.email ? "border-red-400 bg-red-50" : "border-input"
                }`}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.password ? "border-red-400 bg-red-50" : "border-input"
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-warm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Want to sell on VendorHub?{" "}
            <Link href="/seller/register" className="text-accent font-semibold hover:text-accent-dark transition-colors">
              Register as Seller
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md text-center p-10 bg-card rounded-2xl border border-border shadow-warm-lg">
        <p className="text-muted-foreground">Loading sign in...</p>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
