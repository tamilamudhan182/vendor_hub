import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication | VendorHub",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-100 via-warm-50 to-warm-200 flex flex-col relative overflow-hidden">
      {/* Tech Grid Background Overlay */}
      <div className="absolute inset-0 tech-grid-overlay opacity-50 pointer-events-none" />

      {/* Floating Blur Circles */}
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-3xl vibrant-glow-circle pointer-events-none" style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl vibrant-glow-circle pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-primary">
            Vendor<span className="text-accent">Hub</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} VendorHub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
