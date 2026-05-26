"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, Store, MapPin, FileText,
  Eye, EyeOff, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry",
];

type Step = 1 | 2 | 3;

export default function SellerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    // Personal
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    // Shop
    shopName: "", shopDescription: "", gstNumber: "",
    // Location
    city: "", state: "", pincode: "",
  });

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validateStep = (s: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!form.name.trim()) newErrors.name = "Full name is required";
      if (!form.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
      if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone))
        newErrors.phone = "Valid 10-digit Indian number required";
      if (!form.password || form.password.length < 8)
        newErrors.password = "At least 8 characters required";
      else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password))
        newErrors.password = "Must include uppercase and number";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords don't match";
    }

    if (s === 2) {
      if (!form.shopName.trim() || form.shopName.length < 3)
        newErrors.shopName = "Shop name must be at least 3 characters";
      if (!form.shopDescription || form.shopDescription.length < 20)
        newErrors.shopDescription = "Description must be at least 20 characters";
    }

    if (s === 3) {
      if (!form.city.trim()) newErrors.city = "City is required";
      if (!form.state) newErrors.state = "State is required";
      if (!form.pincode || !/^\d{6}$/.test(form.pincode))
        newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => (s < 3 ? (s + 1) as Step : s));
  };

  const prevStep = () => setStep((s) => (s > 1 ? (s - 1) as Step : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone, password: form.password,
          shopName: form.shopName, shopDescription: form.shopDescription,
          gstNumber: form.gstNumber || undefined,
          city: form.city, state: form.state, pincode: form.pincode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Registration failed." });
        toast.error("Registration failed", { description: data.error });
      } else {
        setSuccess(true);
        toast.success("Application submitted!", { description: "Admin will review within 24 hours." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl border border-border shadow-warm-lg p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-3">Application Submitted! 🎉</h2>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Your seller application for <strong className="text-foreground">&quot;{form.shopName}&quot;</strong> has been received.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Our admin team will review your application within 24 hours. You&apos;ll be notified once approved.
          </p>
          <div className="space-y-3">
            <Link href="/auth/signin"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:bg-primary/90 transition-all shadow-warm">
              Sign In to Check Status <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Personal Info", icon: User },
    { num: 2, label: "Shop Details", icon: Store },
    { num: 3, label: "Location", icon: MapPin },
  ];

  return (
    <div className="w-full max-w-lg">
      <div className="bg-card rounded-2xl border border-border shadow-warm-lg overflow-hidden">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-primary to-warm-800 p-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white/80 mb-3">
            <Sparkles className="w-3 h-3" /> Seller Registration
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Join VendorHub</h1>
          <p className="text-white/70 text-sm">Reach thousands of local buyers</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-4 bg-warm-50 border-b border-border">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${isActive || isDone ? "text-accent" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isDone ? "bg-accent border-accent text-white" :
                    isActive ? "bg-accent/10 border-accent text-accent" :
                    "bg-card border-border text-muted-foreground"
                  }`}>
                    {isDone ? "✓" : s.num}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${step > s.num ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-8">
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {errors.general}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {/* ── Step 1: Personal Info ─────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" /> Personal Information
                </h2>

                {[
                  { id: "name", label: "Full Name *", type: "text", placeholder: "Ramesh Agarwal", icon: User },
                  { id: "email", label: "Email Address *", type: "email", placeholder: "you@example.com", icon: Mail },
                  { id: "phone", label: "Phone Number *", type: "tel", placeholder: "9xxxxxxxxx", icon: Phone },
                ].map(({ id, label, type, placeholder, icon: Icon }) => (
                  <div key={id} className="space-y-1.5">
                    <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input id={id} type={type} value={form[id as keyof typeof form]} onChange={set(id)}
                        placeholder={placeholder}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all ${errors[id] ? "border-red-400 bg-red-50" : "border-input"}`}
                      />
                    </div>
                    {errors[id] && <p className="text-xs text-red-600">{errors[id]}</p>}
                  </div>
                ))}

                {/* Password */}
                {[
                  { id: "password", label: "Password *", placeholder: "Min 8 chars, 1 uppercase, 1 number" },
                  { id: "confirmPassword", label: "Confirm Password *", placeholder: "Re-enter password" },
                ].map(({ id, label, placeholder }) => (
                  <div key={id} className="space-y-1.5">
                    <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input id={id} type={showPassword ? "text" : "password"}
                        value={form[id as keyof typeof form]} onChange={set(id)} placeholder={placeholder}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all ${errors[id] ? "border-red-400 bg-red-50" : "border-input"}`}
                      />
                      {id === "password" && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    {errors[id] && <p className="text-xs text-red-600">{errors[id]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* ── Step 2: Shop Details ──────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-accent" /> Shop Details
                </h2>

                <div className="space-y-1.5">
                  <label htmlFor="shopName" className="text-sm font-semibold text-foreground">Shop Name *</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="shopName" type="text" value={form.shopName} onChange={set("shopName")}
                      placeholder="e.g., Agarwal Kirana Store"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all ${errors.shopName ? "border-red-400 bg-red-50" : "border-input"}`}
                    />
                  </div>
                  {errors.shopName && <p className="text-xs text-red-600">{errors.shopName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shopDescription" className="text-sm font-semibold text-foreground">
                    Shop Description * <span className="text-muted-foreground font-normal">({form.shopDescription.length}/500)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea id="shopDescription" value={form.shopDescription} onChange={set("shopDescription")}
                      rows={4} maxLength={500} placeholder="Tell buyers about your shop, what you sell, and what makes you unique..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none ${errors.shopDescription ? "border-red-400 bg-red-50" : "border-input"}`}
                    />
                  </div>
                  {errors.shopDescription && <p className="text-xs text-red-600">{errors.shopDescription}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gstNumber" className="text-sm font-semibold text-foreground">
                    GST Number <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input id="gstNumber" type="text" value={form.gstNumber} onChange={set("gstNumber")}
                    placeholder="e.g., 27ABCDE1234F1Z5"
                    className="w-full px-4 py-2.5 rounded-lg border border-input text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all uppercase"
                  />
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium">
                    📋 Your application will be reviewed by our team within 24 hours. Make sure your shop description is clear and professional.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Location ──────────────────────────── */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" /> Business Location
                </h2>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-semibold text-foreground">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="city" type="text" value={form.city} onChange={set("city")}
                      placeholder="e.g., Mumbai"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all ${errors.city ? "border-red-400 bg-red-50" : "border-input"}`}
                    />
                  </div>
                  {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-sm font-semibold text-foreground">State *</label>
                  <select id="state" value={form.state} onChange={set("state")}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all ${errors.state ? "border-red-400 bg-red-50" : "border-input"}`}>
                    <option value="">Select State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-600">{errors.state}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pincode" className="text-sm font-semibold text-foreground">Pincode *</label>
                  <input id="pincode" type="text" value={form.pincode} onChange={set("pincode")}
                    maxLength={6} placeholder="e.g., 400001"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all ${errors.pincode ? "border-red-400 bg-red-50" : "border-input"}`}
                  />
                  {errors.pincode && <p className="text-xs text-red-600">{errors.pincode}</p>}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-1">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Application Summary</p>
                  <p className="text-sm text-green-900"><strong>Name:</strong> {form.name}</p>
                  <p className="text-sm text-green-900"><strong>Shop:</strong> {form.shopName}</p>
                  <p className="text-sm text-green-900"><strong>Location:</strong> {form.city}, {form.state} - {form.pincode}</p>
                </div>

                <p className="text-xs text-muted-foreground">
                  By registering, you agree to our{" "}
                  <Link href="/seller-terms" className="text-accent hover:underline">Seller Terms</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              {step > 1 && (
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-warm">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>Submitting...</>
                ) : step < 3 ? (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Submit Application <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-accent font-semibold hover:text-accent-dark transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
