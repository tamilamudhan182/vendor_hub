import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VendorHub – Hyperlocal Multi-Vendor Marketplace",
    template: "%s | VendorHub",
  },
  description:
    "Discover unique products from local vendors near you. Shop groceries, fashion, electronics, handmade crafts, and more on VendorHub.",
  keywords: ["hyperlocal marketplace", "multi-vendor", "local shopping", "handmade crafts"],
  authors: [{ name: "VendorHub" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "VendorHub",
    title: "VendorHub – Hyperlocal Multi-Vendor Marketplace",
    description: "Discover unique products from local vendors near you.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "font-sans text-sm",
            },
          }}
        />
      </body>
    </html>
  );
}
