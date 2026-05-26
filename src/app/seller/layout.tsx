import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Store, ArrowLeft, LogOut, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default async function SellerLayout({ children }: SellerLayoutProps) {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  if (session.user.sellerStatus !== "APPROVED") {
    redirect("/seller/pending");
  }

  // Fetch seller shop name for branding
  const shop = await db.sellerProfile.findUnique({
    where: { id: session.user.sellerId! },
    select: { shopName: true },
  });

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-[#E8DDD0]/50 flex flex-col shrink-0">
        {/* Branding header */}
        <div className="h-20 border-b border-[#E8DDD0]/40 flex items-center px-6 gap-2 bg-[#F8F1E9]/20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2C1810] to-[#C4956A] flex items-center justify-center shadow-md animate-float">
            <Store className="w-4.5 h-4.5 text-[#F8F1E9]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-[#2C1810] leading-tight">
              {shop?.shopName || "Seller Portal"}
            </span>
            <span className="text-[10px] font-bold text-[#C4956A] tracking-wider uppercase">
              Seller Dashboard
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8F1E9]/50 hover:text-[#C4956A] font-semibold text-sm text-[#2C1810] transition-all duration-300"
          >
            <LayoutDashboard className="w-4.5 h-4.5 text-[#C4956A]" />
            Dashboard
          </Link>
          
          <Link
            href="/seller/products"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8F1E9]/50 hover:text-[#C4956A] font-semibold text-sm text-[#2C1810] transition-all duration-300"
          >
            <Package className="w-4.5 h-4.5 text-[#C4956A]" />
            Products
          </Link>

          <Link
            href="/seller/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8F1E9]/50 hover:text-[#C4956A] font-semibold text-sm text-[#2C1810] transition-all duration-300"
          >
            <ShoppingCart className="w-4.5 h-4.5 text-[#C4956A]" />
            Orders
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E8DDD0]/40 bg-[#F8F1E9]/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 hover:text-[#C0392B] font-semibold text-sm text-[#7D6E65] transition-all duration-300"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FBF7F2]">
        {/* Top bar header */}
        <header className="h-20 bg-white/50 backdrop-blur-xl border-b border-[#E8DDD0]/40 flex items-center justify-between px-8 shrink-0">
          <h1 className="font-display text-lg font-bold text-[#2C1810]">
            Welcome back, <span className="text-gradient-vibrant">{session.user.name?.split(" ")[0]}</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#2C1810] leading-none">{session.user.name}</p>
              <p className="text-[10px] text-[#7D6E65] mt-0.5">{session.user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C4956A]/10 text-[#8A5F3B] flex items-center justify-center font-bold text-sm border border-[#C4956A]/20">
              {session.user.name ? session.user.name[0].toUpperCase() : "S"}
            </div>
          </div>
        </header>

        {/* Dashboard Pages wrapper */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
