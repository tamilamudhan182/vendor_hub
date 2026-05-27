import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/products", "/auth/signin", "/auth/signup", "/auth/error", "/seller/register"];
const SELLER_ROUTES = ["/seller/dashboard", "/seller/products", "/seller/orders", "/seller/earnings"];
const ADMIN_ROUTES = ["/admin"];
const BUYER_ROUTES = ["/account", "/cart", "/wishlist", "/checkout", "/orders"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Allow public routes and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))
  ) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to sign in
  if (!session) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const { role, sellerStatus } = session.user;

  // Admin routes — must be ADMIN
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  // Seller routes — must be SELLER with APPROVED status
  if (SELLER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "SELLER") {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    if (sellerStatus !== "APPROVED") {
      return NextResponse.redirect(new URL("/seller/pending", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
