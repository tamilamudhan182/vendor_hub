import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order shipping details and pay.",
};

export default async function CheckoutPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect("/auth/signin?callbackUrl=/checkout");
  }

  // Fetch the user's saved profile address details for prefill
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      address: true,
      pincode: true,
      city: true,
      state: true,
      email: true,
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <CheckoutClient initialAddress={user} userEmail={user?.email || ""} />
      </div>
    </div>
  );
}
