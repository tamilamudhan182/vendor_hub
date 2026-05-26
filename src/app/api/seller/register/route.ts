import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { Role, SellerStatus } from "@prisma/client";

const SellerRegisterSchema = z.object({
  // User fields
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  // Shop fields
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  shopDescription: z.string().min(20, "Description must be at least 20 characters"),
  gstNumber: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6, "Enter a valid 6-digit pincode"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SellerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password, shopName, shopDescription, gstNumber, city, state, pincode } = parsed.data;

    // Check duplicate
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + seller profile in transaction
    const { user, sellerProfile } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name, email, phone, password: hashedPassword,
          role: Role.SELLER, city, state, pincode,
        },
      });
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: user.id,
          shopName,
          shopDescription,
          gstNumber: gstNumber || null,
          status: SellerStatus.PENDING,
        },
      });
      return { user, sellerProfile };
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      sellerId: sellerProfile.id,
      message: "Seller registration submitted. Awaiting admin approval.",
    }, { status: 201 });
  } catch (error) {
    console.error("[SELLER_REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
