"use client";

import { useState } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertCircle,
  FileText,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { approveSeller, rejectSeller, processRefundRequest, updateCommissionSetting } from "./actions";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminClientProps {
  stats: {
    totalSales: number;
    totalCommission: number;
    vendorsCount: number;
    ordersCount: number;
  };
  pendingSellers: any[];
  refundRequests: any[];
  allOrders: any[];
  currentCommission: number;
}

export default function AdminClient({
  stats,
  pendingSellers: initialSellers,
  refundRequests: initialRefunds,
  allOrders,
  currentCommission,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"vendors" | "refunds" | "settings" | "orders">("vendors");
  const [pendingSellers, setPendingSellers] = useState(initialSellers);
  const [refundRequests, setRefundRequests] = useState(initialRefunds);
  const [commissionRate, setCommissionRate] = useState(currentCommission);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectSeller, setSelectedRejectSeller] = useState<string | null>(null);

  // Handlers
  const handleApproveSeller = async (id: string) => {
    try {
      const res = await approveSeller(id);
      if (res.success) {
        setPendingSellers((prev) => prev.filter((s) => s.id !== id));
        toast.success("Seller registration approved successfully.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve seller.");
    }
  };

  const handleRejectSeller = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      const res = await rejectSeller(id, rejectReason);
      if (res.success) {
        setPendingSellers((prev) => prev.filter((s) => s.id !== id));
        setSelectedRejectSeller(null);
        setRejectReason("");
        toast.success("Seller registration rejected.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject seller.");
    }
  };

  const handleProcessRefund = async (refundId: string, approve: boolean) => {
    try {
      const res = await processRefundRequest(refundId, approve);
      if (res.success) {
        setRefundRequests((prev) => prev.filter((r) => r.id !== refundId));
        toast.success(approve ? "Refund approved and processed." : "Refund request rejected.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process refund request.");
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateCommissionSetting(commissionRate);
      if (res.success) {
        toast.success(`Platform commission rate updated to ${commissionRate}%.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update commission rate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl font-bold text-primary tracking-tight">
          Admin Control Center
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review vendor sign-ups, handle user refunds, manage commissions, and monitor orders.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales volume */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              ₹{stats.totalSales.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Gross sales through platform
            </p>
          </div>
        </div>

        {/* Commissions Earned */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C4956A]/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Commissions Earned
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#C4956A]/10 text-[#8A5F3B] flex items-center justify-center border border-[#C4956A]/20">
              <Percent className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              ₹{stats.totalCommission.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Accumulated platform revenue
            </p>
          </div>
        </div>

        {/* Vendors count */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Approved Vendors
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              {stats.vendorsCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Active storefronts listed
            </p>
          </div>
        </div>

        {/* Orders Count */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Orders Processed
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              {stats.ordersCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Completed transactions
            </p>
          </div>
        </div>

      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-[#E8DDD0] overflow-x-auto no-scrollbar">
        {[
          { id: "vendors", label: `Vendor Approvals (${pendingSellers.length})` },
          { id: "refunds", label: `Refund Requests (${refundRequests.length})` },
          { id: "orders", label: "All Orders Logs" },
          { id: "settings", label: "Platform Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-6 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 shrink-0 ${
              activeTab === tab.id
                ? "border-[#C4956A] text-[#C4956A] font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* ── Tab 1: Vendor Approvals ── */}
        {activeTab === "vendors" && (
          <div className="space-y-4">
            {pendingSellers.map((seller) => (
              <Card key={seller.id} variant="default" className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Shop Details */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-lg text-primary">
                        {seller.shopName}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                        {seller.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                      {seller.shopDescription || "No description provided."}
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-muted-foreground pt-1.5">
                      <p>Owner: <span className="text-primary font-bold">{seller.user.name}</span></p>
                      <p>Phone: <span className="text-primary">{seller.user.phone}</span></p>
                      <p>GSTIN: <span className="text-primary">{seller.gstNumber || "N/A"}</span></p>
                      <p>City/Pincode: <span className="text-primary">{seller.user.city} ({seller.user.pincode})</span></p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2.5 items-center shrink-0 w-full md:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleApproveSeller(seller.id)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl shadow-sm text-xs gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve Shop
                    </Button>
                    
                    {selectedRejectSeller !== seller.id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRejectSeller(seller.id)}
                        className="flex-1 md:flex-none border-border hover:bg-warm-100 text-[#C0392B] font-bold h-9 px-4 rounded-xl text-xs gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Application
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full md:w-56 bg-warm-50 p-3 rounded-xl border border-border/80 animate-fade-down text-left">
                        <label className="text-[10px] font-bold uppercase text-primary">Reason for Rejection</label>
                        <input
                          type="text"
                          placeholder="e.g. Invalid GSTIN number"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="input h-8 text-[11px] bg-white w-full"
                        />
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRejectSeller(null);
                              setRejectReason("");
                            }}
                            className="h-7 text-[10px] px-2"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectSeller(seller.id)}
                            className="bg-[#C0392B] hover:bg-rose-700 text-white font-bold h-7 px-2 text-[10px]"
                          >
                            Confirm Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            ))}

            {pendingSellers.length === 0 && (
              <div className="bg-card rounded-2xl border border-border/60 py-16 text-center text-muted-foreground text-sm font-semibold">
                🎉 No pending vendor applications for review.
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Refund Requests ── */}
        {activeTab === "refunds" && (
          <div className="space-y-4">
            {refundRequests.map((req) => (
              <Card key={req.id} variant="default" className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Refund details */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-primary">
                        Refund Request for Order ID: <span className="font-mono font-bold text-accent">{req.orderId}</span>
                      </h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      Reason: &ldquo;<span className="text-primary">{req.reason}</span>&rdquo;
                    </p>
                    <div className="flex gap-6 text-xs text-muted-foreground font-semibold pt-1 border-t border-border/40">
                      <p>Refund Amount: <span className="text-primary font-bold">₹{req.amount.toLocaleString("en-IN")}</span></p>
                      <p>Customer: <span className="text-primary">{req.order.user.name}</span></p>
                      <p>Placed: <span className="text-primary">{new Date(req.createdAt).toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2.5 items-center shrink-0 w-full md:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleProcessRefund(req.id, true)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl shadow-sm text-xs gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve & Reverse Payout
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProcessRefund(req.id, false)}
                      className="flex-1 md:flex-none border-border hover:bg-warm-100 text-[#C0392B] font-bold h-9 px-4 rounded-xl text-xs gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Refund
                    </Button>
                  </div>

                </div>
              </Card>
            ))}

            {refundRequests.length === 0 && (
              <div className="bg-card rounded-2xl border border-border/60 py-16 text-center text-muted-foreground text-sm font-semibold">
                🛡️ No active buyer refund requests.
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Platform Settings ── */}
        {activeTab === "settings" && (
          <Card variant="default" className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary font-display">
                Platform Commission Fee
              </CardTitle>
              <CardDescription className="text-xs">
                Configure default percentage deducted from seller transactions upon order success.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCommission} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase block">
                    Commission Rate (%)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                      className="input w-36 h-10 font-bold text-primary text-center"
                      required
                    />
                    <span className="text-sm font-bold text-muted-foreground">%</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadow-warm font-bold text-background h-10 px-5 rounded-xl text-xs shrink-0"
                >
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 4: All Orders ── */}
        {activeTab === "orders" && (
          <div className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-warm-50/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date Placed</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Order Status</th>
                    <th className="px-6 py-4">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {allOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-warm-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{ord.id}</td>
                      <td className="px-6 py-4 font-bold text-primary">{ord.user?.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-semibold">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ₹{ord.total.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-600"
                            : ord.status === "SHIPPED"
                            ? "bg-blue-50 text-blue-600"
                            : ord.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-600"
                            : ord.paymentStatus === "REFUNDED"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
