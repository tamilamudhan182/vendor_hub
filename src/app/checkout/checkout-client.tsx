"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AddressSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  notes: z.string().optional(),
});

type AddressFormValues = z.infer<typeof AddressSchema>;

interface CheckoutClientProps {
  initialAddress: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    pincode?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  userEmail: string;
}

export default function CheckoutClient({ initialAddress, userEmail }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCartStore();

  const cartSubtotal = subtotal();
  const deliveryCharge = cartSubtotal >= 499 ? 0 : 49;
  const grandTotal = cartSubtotal + deliveryCharge;

  // Checkout Page states
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Mock Checkout Modal State
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState<{
    orderId: string;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(AddressSchema) as any,
    defaultValues: {
      name: initialAddress?.name || "",
      phone: initialAddress?.phone || "",
      address: initialAddress?.address || "",
      pincode: initialAddress?.pincode || "",
      city: initialAddress?.city || "",
      state: initialAddress?.state || "",
      notes: "",
    },
  });

  // Load Razorpay SDK Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.warn("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !showMockModal) {
      router.push("/cart");
    }
  }, [items, router, showMockModal]);

  // Form submission handler: creates Razorpay order
  const onSubmit = async (values: AddressFormValues) => {
    if (items.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/orders/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingDetails: values,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await res.json();

      if (orderData.isMock) {
        // Show simulated payment modal
        setMockOrderDetails({
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId,
          amount: orderData.amount,
        });
        setShowMockModal(true);
        setIsLoading(false);
      } else {
        // Trigger real Razorpay
        triggerRealRazorpay(orderData, values);
      }

    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Real Razorpay checkout trigger
  const triggerRealRazorpay = (orderData: any, shippingDetails: AddressFormValues) => {
    if (!razorpayLoaded) {
      toast.error("Razorpay SDK is still loading. Please wait a second and retry.");
      setIsLoading(false);
      return;
    }

    const options = {
      key: orderData.razorpayKeyId,
      amount: Math.round(orderData.amount * 100),
      currency: "INR",
      name: "VendorHub",
      description: "Hyperlocal E-Commerce Checkout",
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: shippingDetails.name,
        email: userEmail,
        contact: shippingDetails.phone,
      },
      theme: {
        color: "#2C1810", // Primary deep warm brown
      },
      handler: async function (response: any) {
        setIsLoading(true);
        try {
          const verifyRes = await fetch("/api/orders/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyResult = await verifyRes.json();
          if (verifyResult.success) {
            clearCart();
            toast.success("Payment completed successfully!");
            router.push(`/checkout/success?orderId=${orderData.orderId}`);
          } else {
            throw new Error(verifyResult.error || "Signature verification failed");
          }
        } catch (verifyError: any) {
          toast.error(verifyError.message || "Payment verification failed.");
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled.");
          setIsLoading(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // Simulated Mock Success/Failure execution
  const handleSimulateMockPayment = async (success: boolean) => {
    if (!mockOrderDetails) return;
    setIsLoading(true);
    setShowMockModal(false);

    try {
      if (success) {
        const verifyRes = await fetch("/api/orders/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: mockOrderDetails.orderId,
            razorpayOrderId: mockOrderDetails.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${mockOrderDetails.orderId}_${Date.now()}`,
            razorpaySignature: "mock_signature_approved",
          }),
        });

        const verifyResult = await verifyRes.json();
        if (verifyResult.success) {
          clearCart();
          toast.success("Simulated payment succeeded!");
          router.push(`/checkout/success?orderId=${mockOrderDetails.orderId}`);
        } else {
          throw new Error("Simulated verification verification check failed");
        }
      } else {
        // Send a request to fail payment
        toast.error("Simulated payment failed.");
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Simulated payment verification failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
      
      {/* Page Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary tracking-tight">
            Checkout
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Complete your shipping address and pay securely.
          </p>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="sm" className="text-xs font-bold text-accent hover:bg-warm-100 flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bag
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left 7 Cols: Address Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base font-bold text-primary font-display">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Receiver&apos;s Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priyan Sharma"
                    {...register("name")}
                    className={`input w-full ${errors.name ? "border-rose-400 focus:ring-rose-200" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9811234567"
                    {...register("phone")}
                    className={`input w-full ${errors.phone ? "border-rose-400 focus:ring-rose-200" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>
                  )}
                </div>

                {/* Address Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Street Address & Landmarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 104, Block B, Silver Heights Apartments, Park Avenue"
                    {...register("address")}
                    className={`input w-full ${errors.address ? "border-rose-400 focus:ring-rose-200" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-500 font-medium">{errors.address.message}</p>
                  )}
                </div>

                {/* Pincode & City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary tracking-wide uppercase">
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 302001"
                      {...register("pincode")}
                      className={`input w-full ${errors.pincode ? "border-rose-400 focus:ring-rose-200" : ""}`}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-rose-500 font-medium">{errors.pincode.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary tracking-wide uppercase">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur"
                      {...register("city")}
                      className={`input w-full ${errors.city ? "border-rose-400 focus:ring-rose-200" : ""}`}
                    />
                    {errors.city && (
                      <p className="text-xs text-rose-500 font-medium">{errors.city.message}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary tracking-wide uppercase">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajasthan"
                      {...register("state")}
                      className={`input w-full ${errors.state ? "border-rose-400 focus:ring-rose-200" : ""}`}
                    />
                    {errors.state && (
                      <p className="text-xs text-rose-500 font-medium">{errors.state.message}</p>
                    )}
                  </div>

                </div>

                {/* Delivery Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Delivery Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave package with security guard"
                    {...register("notes")}
                    className="input w-full bg-background"
                  />
                </div>

              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="w-full mt-6 shadow-warm font-bold text-background text-base h-12 rounded-xl gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Pay & Place Order
                  <ArrowRight className="w-4.5 h-4.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right 5 Cols: Items Summary */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border/80 shadow-card p-6 space-y-6">
          <h3 className="font-display font-bold text-lg text-primary border-b border-border/60 pb-3">
            Summary of Items
          </h3>

          <div className="divide-y divide-border/40 max-h-[260px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="py-4.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-warm-50 overflow-hidden border shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-primary truncate max-w-[160px] sm:max-w-[200px]">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-accent font-bold uppercase mt-0.5">
                      {item.sellerName}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Qty: {item.quantity} · Price: ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-xs text-primary shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 pt-5 space-y-3.5 text-xs text-primary font-semibold">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Local Shipping</span>
              <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between text-sm pt-3.5 border-t border-border/60">
              <span className="font-bold text-primary font-display">Total to Pay</span>
              <span className="font-bold text-primary font-display text-base">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/40 text-[10px] text-emerald-800 leading-relaxed font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your transaction is secured by VendorHub Escrow. Sellers are paid only after you confirm successful delivery.
            </span>
          </div>

        </div>

      </div>

      {/* ─── Simulated payment checkout modal ─────────────────── */}
      {showMockModal && mockOrderDetails && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-premium rounded-3xl border border-[#E8DDD0] shadow-warm-lg overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#2C1810] to-[#4A2E16] text-[#F8F1E9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm text-white rounded-lg flex items-center justify-center font-bold text-xs border border-white/20">
                  VH
                </div>
                <h3 className="font-display font-bold text-base text-[#F8F1E9]">
                  VendorHub Payment Sandbox
                </h3>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-[#F8F1E9]">
                Simulate Mode
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">Simulated Order Amount</p>
                <h4 className="text-2xl font-bold font-display text-[#2C1810]">
                  ₹{mockOrderDetails.amount.toLocaleString("en-IN")}
                </h4>
                <p className="text-[10px] text-muted-foreground font-mono leading-none">
                  RZP ID: {mockOrderDetails.razorpayOrderId}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F1E9]/40 border border-[#E8DDD0]/50 text-xs leading-relaxed text-muted-foreground space-y-2">
                <div className="flex items-center gap-1 text-[#2C1810] font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#C4956A] shrink-0" />
                  No Active Razorpay Tokens Configured
                </div>
                <p>
                  Since you are testing locally in sandbox mode without real credentials, select a payment result below to complete the order lifecycle.
                </p>
              </div>

              {/* Simulation outcomes */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSimulateMockPayment(true)}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Simulate Payment SUCCESS
                </button>
                
                <button
                  onClick={() => handleSimulateMockPayment(false)}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C0392B] border border-rose-200 font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                >
                  Simulate Payment FAILURE
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F1E9]/20 border-t border-[#E8DDD0]/30 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-semibold">
                VendorHub E-Commerce Demo System
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
