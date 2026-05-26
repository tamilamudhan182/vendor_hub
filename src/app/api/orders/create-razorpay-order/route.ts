import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
const isRealRazorpay = keyId && keyId !== "rzp_test_xxxxxxxxxx" && !keyId.startsWith("rzp_test_xxxx");

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, shippingDetails } = await req.json();

    if (!items || items.length === 0 || !shippingDetails) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // 1. Fetch products from database to calculate real prices
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        seller: {
          select: { id: true, commissionRate: true },
        },
      },
    });

    let subtotal = 0;
    let totalCommission = 0;
    const orderItemsToCreate: any[] = [];

    // Match client quantity and check stock
    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${dbProduct.name}` },
          { status: 400 }
        );
      }

      const itemTotal = dbProduct.price * item.quantity;
      subtotal += itemTotal;

      // Commission calculations: e.g. 10% platform commission
      const commissionRate = dbProduct.seller?.commissionRate || 10.0;
      const commissionAmount = (itemTotal * commissionRate) / 100;
      totalCommission += commissionAmount;

      orderItemsToCreate.push({
        productId: dbProduct.id,
        sellerId: dbProduct.sellerId,
        quantity: item.quantity,
        price: dbProduct.price,
      });
    }

    // Shipping fee: free above ₹499
    const deliveryCharge = subtotal >= 499 ? 0 : 49;
    const grandTotal = subtotal + deliveryCharge;

    // 2. Create the Order record in database in a transaction
    const dbOrder = await db.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotal,
        deliveryCharge,
        commission: totalCommission,
        total: grandTotal,
        shippingName: shippingDetails.name,
        shippingPhone: shippingDetails.phone,
        shippingAddress: shippingDetails.address,
        shippingPincode: shippingDetails.pincode,
        shippingCity: shippingDetails.city,
        shippingState: shippingDetails.state,
        notes: shippingDetails.notes || null,
        items: {
          create: orderItemsToCreate,
        },
      },
    });

    // 3. Generate Razorpay / Mock Order
    let razorpayOrderId = "";
    if (isRealRazorpay) {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const options = {
          amount: Math.round(grandTotal * 100), // in paise
          currency: "INR",
          receipt: dbOrder.id,
        };

        const razorpayOrder = await instance.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpError) {
        console.error("Razorpay instance order creation failed:", rzpError);
        // Fallback to mock order generation if API keys fail
        razorpayOrderId = `order_mock_${dbOrder.id}_${Date.now()}`;
      }
    } else {
      // Mock Razorpay Order ID for sandbox simulation
      razorpayOrderId = `order_mock_${dbOrder.id}_${Date.now()}`;
    }

    // 4. Update the DB order with the generated razorpayOrderId
    await db.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId },
    });

    return NextResponse.json({
      success: true,
      orderId: dbOrder.id,
      razorpayOrderId,
      amount: grandTotal,
      isMock: !isRealRazorpay || razorpayOrderId.startsWith("order_mock_"),
      razorpayKeyId: keyId || "rzp_test_xxxxxxxxxx",
    });

  } catch (error: any) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
