"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "At least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password))
      newErrors.password = "Must include an uppercase letter and a number";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "BUYER",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Registration failed. Try again." });
        toast.error("Registration failed");
      } else {
        setSuccess(true);
        toast.success("Account created!", { description: "Please sign in to continue." });
        setTimeout(() => router.push("/auth/signin"), 2000);
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-premium rounded-3xl p-10 text-center border border-white/60 shadow-warm-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary mb-2">You&apos;re in!</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created successfully. Redirecting to sign in...
          </p>
          <Link href="/auth/signin" className="btn-accent inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white">
            Sign In Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const fields = [
    { id: "name", label: "Full Name", type: "text", placeholder: "Priya Sharma", icon: User, autoComplete: "name" },
    { id: "email", label: "Email Address", type: "email", placeholder: "you@example.com", icon: Mail, autoComplete: "email" },
    { id: "phone", label: "Phone Number (Optional)", type: "tel", placeholder: "9xxxxxxxxx", icon: Phone, autoComplete: "tel" },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="glass-premium rounded-3xl p-8 md:p-10 border border-white/60 shadow-warm-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-accent font-semibold hover:text-accent-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {errors.general}
            </div>
          )}

          {/* Text Fields */}
          {fields.map(({ id, label, type, placeholder, icon: Icon, autoComplete }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-semibold text-foreground">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id={id}
                  type={type}
                  value={form[id as keyof typeof form]}
                  onChange={set(id)}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                    errors[id] ? "border-red-400 bg-red-50" : "border-input"
                  }`}
                />
              </div>
              {errors[id] && <p className="text-xs text-red-600 font-medium">{errors[id]}</p>}
            </div>
          ))}

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.password ? "border-red-400 bg-red-50" : "border-input"
                }`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
                  errors.confirmPassword ? "border-red-400 bg-red-50" : "border-input"
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 shadow-warm mt-2">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>Creating account...</>
            ) : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Want to sell?{" "}
            <Link href="/seller/register" className="text-accent font-semibold hover:text-accent-dark">
              Register as a Seller
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
