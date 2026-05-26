import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Store, Shield, Truck, ArrowRight, ShoppingBag, LayoutDashboard } from "lucide-react";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import PersonalizedRecommendations from "@/components/personalized-recommendations";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "VendorHub – Hyperlocal Multi-Vendor Marketplace",
  description: "Discover and shop premium products from local vendors near you.",
};

const features = [
  {
    icon: Store,
    title: "Local Vendors First",
    desc: "Shop from verified local sellers, artisans, and family-owned shops in your area.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Assistance",
    desc: "Smart search that translates your needs and finds local items semantically.",
  },
  {
    icon: Shield,
    title: "Secure Local Escrow",
    desc: "Razorpay-backed checkout with buyer protection and hassle-free returns.",
  },
  {
    icon: Truck,
    title: "Ultra-Fast Delivery",
    desc: "Hyperlocal fulfillment ensures your orders arrive quickly from nearby stores.",
  },
];

export default async function HomePage() {
  const session = await auth();

  // Fetch real data from database
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  const featuredProducts = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      seller: {
        select: { shopName: true },
      },
    },
    take: 4,
  });

  const bestSellers = await db.product.findMany({
    where: { isActive: true, isBestSeller: true },
    include: {
      seller: {
        select: { shopName: true },
      },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ── Role Status Welcome Bar ────────────────────────── */}
      {session && (
        <div className="bg-primary text-background border-b border-primary-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>
                Logged in as <strong className="text-white">{session.user.name}</strong> ({session.user.role === 'ADMIN' ? 'Platform Administrator' : session.user.role === 'SELLER' ? 'Store Vendor' : 'Buyer'})
              </span>
            </div>
            <div className="flex items-center gap-4">
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="text-accent hover:underline font-bold text-xs uppercase tracking-wider">
                  Admin Panel →
                </Link>
              )}
              {session.user.role === "SELLER" && (
                <Link href="/seller/dashboard" className="text-accent hover:underline font-bold text-xs uppercase tracking-wider">
                  Seller Dashboard →
                </Link>
              )}
              {session.user.role === "BUYER" && (
                <Link href="/orders" className="text-accent hover:underline font-bold text-xs uppercase tracking-wider">
                  Track Orders →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-vibrant-hero border-b border-border/40">
        {/* Tech Grid Background Overlay */}
        <div className="absolute inset-0 tech-grid-overlay opacity-60 pointer-events-none" />

        {/* Decorative Floating Blur Spheres */}
        <div className="absolute top-1/4 right-[10%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-3xl vibrant-glow-circle pointer-events-none" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-10 left-[5%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl vibrant-glow-circle pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute top-10 left-1/3 w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-3xl vibrant-glow-circle pointer-events-none" style={{ animationDelay: "4s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/25 px-4.5 py-1.5 text-xs font-bold text-accent-dark tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                Hyperlocal. Sustainable. AI-Powered.
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.12]">
                <span className="text-gradient-vibrant">Support local shops.</span><br />
                <span className="text-accent italic font-normal">Discover unique gems</span><br />
                <span className="text-primary">right in your city.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Connect directly with certified neighbourhood vendors. Buy fresh groceries, handmade crafts, boutique fashion, and tech accessories, with AI smart search.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {session?.user.role === "SELLER" ? (
                  <>
                    <Link href="/products">
                      <Button variant="default" size="lg" className="btn-premium shadow-warm font-semibold group h-12 px-6">
                        Shop Catalog
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/seller/dashboard">
                      <Button variant="accent" size="lg" className="btn-accent-premium shadow-warm text-background font-bold h-12 px-6">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : session?.user.role === "ADMIN" ? (
                  <>
                    <Link href="/products">
                      <Button variant="default" size="lg" className="btn-premium shadow-warm font-semibold group h-12 px-6">
                        View Marketplace
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/admin">
                      <Button variant="accent" size="lg" className="btn-accent-premium shadow-warm text-background font-bold h-12 px-6">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Go to Admin Panel
                      </Button>
                    </Link>
                  </>
                ) : session?.user.role === "BUYER" ? (
                  <>
                    <Link href="/products">
                      <Button variant="default" size="lg" className="btn-premium shadow-warm font-semibold group h-12 px-6">
                        Shop Marketplace
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="outline" size="lg" className="border-border hover:bg-white/50 backdrop-blur-sm font-semibold h-12 px-6">
                        <ShoppingBag className="w-4 h-4 mr-2 text-accent" />
                        Track My Orders
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/products">
                      <Button variant="default" size="lg" className="btn-premium shadow-warm font-semibold group h-12 px-6">
                        Shop Marketplace
                        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/seller/register">
                      <Button variant="outline" size="lg" className="border-border hover:bg-white/50 backdrop-blur-sm font-semibold h-12 px-6">
                        <Store className="w-4 h-4 mr-2 text-accent" />
                        Become a Seller
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick stats banner */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-border/60 max-w-lg">
                <div className="p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-gradient-vibrant font-display">500+</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Local Stores</p>
                </div>
                <div className="p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-gradient-vibrant font-display">12K+</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Unique Items</p>
                </div>
                <div className="p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-gradient-vibrant font-display">100%</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Verified</p>
                </div>
              </div>
            </div>

            {/* Hero Image / Card Grid */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border shadow-warm-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
                  alt="Local Marketplace Vendor"
                  fill
                  sizes="400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                
                {/* Floating Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-warm-md flex items-center gap-4 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-primary">AI Recommendation</h3>
                    <p className="text-xs text-muted-foreground">Find products tailored to your city & tastes instantly.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Categories Grid ────────────────────────────────── */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
              Explore by Category
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Carefully curated items from verified neighbourhood stores
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-5 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm hover:border-accent/50 hover:bg-white hover:shadow-warm-md hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-warm-100 to-warm-50 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 mb-3 border border-border/20 shadow-sm">
                  {cat.icon || "📦"}
                </div>
                <span className="text-xs font-bold text-center text-primary leading-tight group-hover:text-accent transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ───────────────────────────────────── */}
      <section className="py-20 bg-warm-50 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold tracking-wider text-accent uppercase mb-1 block">
                Top Rated Local Goods
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                Best Sellers in Your Area
              </h2>
            </div>
            <Link href="/products?sort=sales" className="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 group">
              View All
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
            {bestSellers.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No best sellers available at the moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Premium Collection Banner ─────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary text-background shadow-warm-lg">
            {/* Banner Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C0E08] via-[#2C1810] to-[#5C3D2B]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(196,149,106,0.3),_transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 tech-grid-overlay opacity-15 pointer-events-none" />

            <div className="relative z-10 px-8 py-16 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl text-left space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Support Local Craftsmanship
                </span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                  Handmade Treasures from Local Artisans
                </h2>
                <p className="text-sm sm:text-base text-warm-100/70 leading-relaxed">
                  Discover custom pottery, hand-knotted macramé wall art, organic beauty kits, and ethnic clothing sourced straight from regional designers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
                <Link href="/products?category=handmade-crafts" className="w-full sm:w-auto">
                  <Button variant="accent" size="lg" className="w-full text-background font-bold shadow-warm">
                    Explore Crafts
                  </Button>
                </Link>
                <Link href="/seller/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white font-bold">
                    Become a Creator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Personalized Recommendations ────────────────── */}
      <section className="py-20 bg-background border-t border-border/40 relative overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="ai-container-glow p-8 md:p-10 rounded-[2rem]">
            <PersonalizedRecommendations />
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="py-20 bg-warm-50 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold tracking-wider text-accent uppercase mb-1 block">
                Editor&apos;s Choices
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                Featured Products
              </h2>
            </div>
            <Link href="/products?featured=true" className="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 group">
              View All
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
            {featuredProducts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No featured products listed yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Value Proposition (Why VendorHub) ──────────────── */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
              Why Shop on VendorHub?
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              We connect technology with community to offer a better shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group bg-white p-7 rounded-2xl border border-border shadow-sm hover:border-accent/40 hover:shadow-warm-md hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent-dark flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Brand Info */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-background rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5 text-[#F8F1E9]" />
                </div>
                <span className="font-display text-xl font-bold text-primary">
                  Vendor<span className="text-accent">Hub</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Hyperlocal Multi-Vendor E-Commerce Platform. Supporting local businesses, craftsmen, and stores through technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
                Shop with Us
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=groceries-kirana" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    Groceries
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=handmade-crafts" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    Handmade Crafts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Seller Links */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
                For Sellers
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/seller/register" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    Apply to Sell
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    Seller Login
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                    Seller Support
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/60 pt-8 gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VendorHub. Hyperlocal. AI-Powered. Built for India.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-accent font-medium">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-accent font-medium">Terms of Service</Link>
              <Link href="/support" className="text-xs text-muted-foreground hover:text-accent font-medium">Help & Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
