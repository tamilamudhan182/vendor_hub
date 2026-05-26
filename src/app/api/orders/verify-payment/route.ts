import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing verification parameters" },
        { status: 400 }
      );
    }

    const isMock = razorpayOrderId.startsWith("order_mock_");
    let verified = false;

    if (isMock) {
      // For mock order, we verify based on signature pattern matching in sandbox mode
      verified = razorpaySignature === "mock_signature_approved";
    } else {
      // Real Razorpay signature check
      const text = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      verified = expectedSignature === razorpaySignature;
    }

    if (!verified) {
      // Update order to payment failed
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // ─── Process Payment Success in Database Transaction ────────────────────
    await db.$transaction(async (tx) => {
      // 1. Update the Order status
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          razorpayPaymentId,
          razorpaySignature,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: true,
                },
              },
            },
          },
        },
      });

      // 2. Decrement product stock & increment sales, and credit sellers
      for (const item of order.items) {
        // Stock subtraction
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });

        // Calculate seller payout: item total minus platform commission rate
        const itemTotal = item.price * item.quantity;
        const commissionRate = item.product.seller?.commissionRate || 10.0;
        const commissionFee = (itemTotal * commissionRate) / 100;
        const sellerNetEarnings = itemTotal - commissionFee;

        // Credit seller pending payouts
        await tx.sellerProfile.update({
          where: { id: item.sellerId },
          data: {
            pendingPayout: { increment: sellerNetEarnings },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and order finalized.",
    });

  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
