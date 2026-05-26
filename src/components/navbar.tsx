"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Settings,
  Search,
  Store,
  Compass,
} from "lucide-react";
import { useCartStore, useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Zustand states
  const cartItemsCount = useCartStore((state) => state.totalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  // Component states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiSearch, setIsAiSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to products search page
    const params = new URLSearchParams();
    params.set("search", searchQuery.trim());
    if (isAiSearch) {
      params.set("ai", "true");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-warm-sm border-b border-accent/20"
          : "bg-background/80 backdrop-blur-md border-b border-border/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary text-background rounded-xl flex items-center justify-center shadow-warm-md group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-5 h-5 text-[#F8F1E9]" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-primary">
                Vendor<span className="text-accent">Hub</span>
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={
                    isAiSearch
                      ? "Describe what you need (e.g. ingredients for butter chicken)..."
                      : "Search local products, shops..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-11 pl-12 pr-24 rounded-full border bg-white/70 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-300 ${
                    isAiSearch
                      ? "border-accent/80 focus:border-accent shadow-[0_0_15px_rgba(196,149,106,0.25)]"
                      : "border-border/80 focus:border-accent/60 focus:shadow-[0_0_10px_rgba(44,24,16,0.05)]"
                  }`}
                />
                
                {/* Search Icon */}
                <div className="absolute left-4 text-muted/80">
                  <Search className="w-4 h-4" />
                </div>

                {/* AI Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsAiSearch(!isAiSearch)}
                  className={`absolute right-14 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isAiSearch
                      ? "bg-accent/25 text-accent-dark border border-accent/30 animate-pulse"
                      : "bg-warm-100 hover:bg-warm-200 text-muted-foreground border border-transparent"
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isAiSearch ? "text-accent-dark" : "text-accent"}`} />
                  <span className="hidden lg:inline">AI Assist</span>
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  className="absolute right-1.5 w-10 h-8 rounded-full bg-primary hover:bg-primary-dark text-background flex items-center justify-center shadow-warm transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-[#F8F1E9]" />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Links & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors ${
                pathname === "/products"
                  ? "text-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop
            </Link>

            <Link
              href="/seller/register"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === "/seller/register"
                  ? "text-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4 text-accent" />
              Sell with Us
            </Link>

            {/* Separator */}
            <div className="h-5 w-px bg-border/60" />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Heart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-background text-[10px] font-bold rounded-full flex items-center justify-center border border-background pulse-glow">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border border-background pulse-glow">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-warm-100 animate-pulse border border-border" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-full hover:bg-warm-100 transition-colors border border-transparent hover:border-border/60"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/15 text-accent-dark flex items-center justify-center font-semibold text-sm border border-accent/20">
                    {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-foreground max-w-[100px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-warm-lg py-2.5 z-20 animate-fade-in animate-duration-200">
                      <div className="px-4 py-2 border-b border-border/60 mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Logged in as
                        </p>
                        <p className="text-sm font-bold text-foreground truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-accent/10 text-accent-dark border border-accent/15">
                          {session.user.role}
                        </span>
                      </div>

                      {/* Role-based dashboard links */}
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-warm-100 hover:text-accent font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      {session.user.role === "SELLER" && (
                        <Link
                          href="/seller/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-warm-100 hover:text-accent font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Seller Dashboard
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-warm-100 hover:text-accent font-medium transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-rose-50 font-semibold transition-colors mt-2 border-t border-border/40"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button variant="accent" size="sm" className="shadow-warm font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Cart Icon Mobile */}
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-warm-100 transition-all border border-transparent"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="px-4 py-5 space-y-4">
            
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={isAiSearch ? "Describe what you need..." : "Search local products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-10 pl-10 pr-24 rounded-full border bg-background text-sm text-foreground focus:outline-none transition-all ${
                  isAiSearch ? "border-accent" : "border-border"
                }`}
              />
              <div className="absolute left-3.5 top-3 text-muted/80">
                <Search className="w-3.5 h-3.5" />
              </div>
              
              <button
                type="button"
                onClick={() => setIsAiSearch(!isAiSearch)}
                className={`absolute right-12 top-1.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isAiSearch ? "bg-accent/20 text-accent-dark border border-accent/20" : "bg-warm-100 text-muted-foreground"
                }`}
              >
                <Sparkles className="w-2.5 h-2.5 text-accent" />
                AI
              </button>

              <button
                type="submit"
                className="absolute right-1 top-1 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center"
              >
                <Search className="w-3 h-3 text-[#F8F1E9]" />
              </button>
            </form>

            {/* Nav Links */}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/products"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm-100 font-semibold text-foreground"
              >
                <Compass className="w-4 h-4 text-accent" />
                Shop Marketplace
              </Link>
              <Link
                href="/seller/register"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm-100 font-semibold text-foreground"
              >
                <Store className="w-4 h-4 text-accent" />
                Become a Seller
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm-100 font-semibold text-foreground"
              >
                <Heart className="w-4 h-4 text-[#C0392B]" />
                Wishlist ({wishlistItemsCount})
              </Link>
            </div>

            {/* Auth / Profile Area */}
            <div className="border-t border-border/60 pt-4">
              {session?.user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center font-bold">
                      {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border bg-background hover:bg-warm-100 text-sm font-semibold text-foreground"
                      >
                        Admin Panel
                      </Link>
                    )}
                    {session.user.role === "SELLER" && (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border bg-background hover:bg-warm-100 text-sm font-semibold text-foreground"
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border bg-background hover:bg-warm-100 text-sm font-semibold text-foreground"
                    >
                      My Orders
                    </Link>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-[#C0392B] hover:bg-rose-100 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    href="/auth/signin"
                    className="w-full py-2.5 rounded-xl border border-border text-center font-semibold text-foreground hover:bg-warm-100 text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full py-2.5 rounded-xl bg-accent text-background text-center font-semibold text-sm hover:bg-[#B07A4E]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </header>
  );
}
