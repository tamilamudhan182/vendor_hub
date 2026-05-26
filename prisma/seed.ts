import { PrismaClient, Role, SellerStatus, OrderStatus, PayStatus, ItemStatus, PayoutStatus, RefundStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Load .env manually for seed
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting VendorHub seed...\n");

  // ── Clean existing data ───────────────────────────────────────────────────
  console.log("🧹 Cleaning existing data...");
  await prisma.browsingHistory.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.platformSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleaned.\n");

  // ── Platform Settings ─────────────────────────────────────────────────────
  console.log("⚙️  Creating platform settings...");
  await prisma.platformSettings.createMany({
    data: [
      { key: "commission_percent", value: "10" },
      { key: "delivery_charge_default", value: "49" },
      { key: "free_delivery_above", value: "499" },
      { key: "platform_name", value: "VendorHub" },
      { key: "support_email", value: "support@vendorhub.in" },
    ],
  });

  // ── Categories ────────────────────────────────────────────────────────────
  console.log("📂 Creating categories...");
  const categoriesData = [
    {
      name: "Groceries & Kirana",
      slug: "groceries-kirana",
      description: "Fresh produce, staples, spices, and daily essentials from local kirana stores",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      icon: "🛒",
      sortOrder: 1,
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Clothing, footwear, and accessories from local designers and boutiques",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
      icon: "👗",
      sortOrder: 2,
    },
    {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets, accessories, and tech products from trusted local sellers",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      icon: "📱",
      sortOrder: 3,
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Cookware, decor, furniture and everything for your home",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      icon: "🏠",
      sortOrder: 4,
    },
    {
      name: "Handmade Crafts",
      slug: "handmade-crafts",
      description: "Unique handcrafted items made with love by local artisans",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      icon: "🎨",
      sortOrder: 5,
    },
    {
      name: "Beauty & Wellness",
      slug: "beauty-wellness",
      description: "Skincare, haircare, organic beauty products, and wellness essentials",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
      icon: "💄",
      sortOrder: 6,
    },
    {
      name: "Stationery & Books",
      slug: "stationery-books",
      description: "Office supplies, art materials, books, and educational tools",
      image: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800&q=80",
      icon: "✏️",
      sortOrder: 7,
    },
    {
      name: "Food & Beverages",
      slug: "food-beverages",
      description: "Local specialties, pickles, sweets, snacks, teas, and artisan foods",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      icon: "🍽️",
      sortOrder: 8,
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.create({ data: cat })
    )
  );
  console.log(`✅ Created ${categories.length} categories.\n`);

  // ── Users: Admin ──────────────────────────────────────────────────────────
  console.log("👑 Creating admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin VendorHub",
      email: "admin@vendorhub.in",
      password: await hashPassword("Admin@123"),
      role: Role.ADMIN,
      phone: "9000000001",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  });
  console.log(`✅ Admin: ${adminUser.email}\n`);

  // ── Users: Buyers ─────────────────────────────────────────────────────────
  console.log("🛍️  Creating buyer users...");
  const buyerPassword = await hashPassword("Buyer@123");
  const buyersData = [
    { name: "Priya Sharma", email: "priya@example.com", phone: "9811234567", city: "Delhi", state: "Delhi", pincode: "110001" },
    { name: "Rahul Mehta", email: "rahul@example.com", phone: "9822345678", city: "Mumbai", state: "Maharashtra", pincode: "400002" },
    { name: "Ananya Singh", email: "ananya@example.com", phone: "9833456789", city: "Bangalore", state: "Karnataka", pincode: "560001" },
  ];
  const buyers = await Promise.all(
    buyersData.map((b) =>
      prisma.user.create({ data: { ...b, password: buyerPassword, role: Role.BUYER } })
    )
  );
  console.log(`✅ Created ${buyers.length} buyers.\n`);

  // ── Users: Sellers ────────────────────────────────────────────────────────
  console.log("🏪 Creating seller users & profiles...");
  const sellerPassword = await hashPassword("Seller@123");
  const sellersData = [
    {
      user: { name: "Ramesh Agarwal", email: "ramesh@kirana.in", phone: "9844567890", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
      shop: {
        shopName: "Agarwal Kirana & Provisions",
        shopDescription: "Your neighbourhood grocery store since 1985. Fresh produce, quality grains, and daily essentials delivered with love.",
        shopLogo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
        gstNumber: "08ABCDE1234F1Z5",
        bankAccount: "1234567890",
        ifscCode: "SBIN0001234",
        status: SellerStatus.APPROVED,
        commissionRate: 8.0,
        totalEarnings: 125000,
        pendingPayout: 18500,
      },
    },
    {
      user: { name: "Meera Iyer", email: "meera@crafthouse.in", phone: "9855678901", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
      shop: {
        shopName: "Meera's Craft House",
        shopDescription: "Handcrafted treasures made with traditional South Indian techniques. Every piece tells a story of heritage and artistry.",
        shopLogo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
        gstNumber: "33FGHIJ5678K2Z3",
        bankAccount: "9876543210",
        ifscCode: "HDFC0005678",
        status: SellerStatus.APPROVED,
        commissionRate: 10.0,
        totalEarnings: 87600,
        pendingPayout: 12400,
      },
    },
    {
      user: { name: "Sunil Kumar", email: "sunil@techpoint.in", phone: "9866789012", city: "Hyderabad", state: "Telangana", pincode: "500001" },
      shop: {
        shopName: "TechPoint Electronics",
        shopDescription: "Genuine electronics, accessories, and gadgets at competitive prices. Authorized dealer for multiple brands.",
        shopLogo: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
        gstNumber: "36KLMNO9012L3Z7",
        bankAccount: "1122334455",
        ifscCode: "ICIC0009012",
        status: SellerStatus.APPROVED,
        commissionRate: 7.5,
        totalEarnings: 215000,
        pendingPayout: 28000,
      },
    },
    {
      user: { name: "Lakshmi Nair", email: "lakshmi@organicbeauty.in", phone: "9877890123", city: "Kochi", state: "Kerala", pincode: "682001" },
      shop: {
        shopName: "Kerala Organics & Beauty",
        shopDescription: "100% natural beauty and wellness products made from Kerala's finest herbs and botanicals. Cruelty-free, sustainable.",
        shopLogo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
        gstNumber: "32PQRST3456M4Z1",
        bankAccount: "5544332211",
        ifscCode: "AXIS0003456",
        status: SellerStatus.APPROVED,
        commissionRate: 10.0,
        totalEarnings: 68000,
        pendingPayout: 9500,
      },
    },
    {
      user: { name: "Arjun Patel", email: "arjun@fashionboutique.in", phone: "9888901234", city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
      shop: {
        shopName: "Arjun's Fashion Boutique",
        shopDescription: "Contemporary Indian fashion blending traditional Gujarati craftsmanship with modern designs. Exclusive collections.",
        shopLogo: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
        gstNumber: "24UVWXY7890N5Z9",
        bankAccount: "6677889900",
        ifscCode: "PUNB0007890",
        status: SellerStatus.APPROVED,
        commissionRate: 12.0,
        totalEarnings: 94500,
        pendingPayout: 14200,
      },
    },
    {
      user: { name: "Divya Reddy", email: "divya@homeflavors.in", phone: "9899012345", city: "Pune", state: "Maharashtra", pincode: "411001" },
      shop: {
        shopName: "Divya's Home Flavors",
        shopDescription: "Authentic homemade pickles, chutneys, sweets, and snacks made fresh with traditional recipes passed down generations.",
        shopLogo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80",
        shopBanner: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80",
        gstNumber: "27ZABCD2345O6Z2",
        bankAccount: "3344556677",
        ifscCode: "KOTAK0002345",
        status: SellerStatus.PENDING,
        commissionRate: 10.0,
        totalEarnings: 0,
        pendingPayout: 0,
      },
    },
  ];

  const sellers: Array<{ userId: string; shopId: string; shopName: string }> = [];
  for (const sd of sellersData) {
    const user = await prisma.user.create({
      data: { ...sd.user, password: sellerPassword, role: Role.SELLER },
    });
    const shop = await prisma.sellerProfile.create({
      data: { userId: user.id, ...sd.shop },
    });
    sellers.push({ userId: user.id, shopId: shop.id, shopName: shop.shopName });
  }
  console.log(`✅ Created ${sellers.length} sellers.\n`);

  // ── Payouts for approved sellers ──────────────────────────────────────────
  console.log("💰 Creating payout history...");
  const approvedSellers = sellers.slice(0, 5);
  for (const seller of approvedSellers) {
    await prisma.payout.createMany({
      data: [
        {
          sellerId: seller.shopId,
          amount: randomFloat(8000, 30000),
          status: PayoutStatus.COMPLETED,
          processedAt: daysAgo(60),
          notes: "Monthly settlement - March 2024",
        },
        {
          sellerId: seller.shopId,
          amount: randomFloat(10000, 35000),
          status: PayoutStatus.COMPLETED,
          processedAt: daysAgo(30),
          notes: "Monthly settlement - April 2024",
        },
        {
          sellerId: seller.shopId,
          amount: randomFloat(5000, 15000),
          status: PayoutStatus.PENDING,
          notes: "Pending settlement - May 2024",
        },
      ],
    });
  }
  console.log("✅ Payout history created.\n");

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("📦 Creating products...");
  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.slug] = c.id; });

  const [ramesh, meera, sunil, lakshmi, arjun, divya] = sellers;

  const productsData = [
    // ── Groceries (Ramesh)
    {
      sellerId: ramesh.shopId,
      categoryId: catMap["groceries-kirana"],
      name: "Premium Basmati Rice 5kg",
      slug: "premium-basmati-rice-5kg",
      description: "Aged long-grain basmati rice from the foothills of the Himalayas. Known for its distinct aroma, fluffy texture, and rich taste. Perfect for biryanis, pulaos, and everyday cooking. Naturally aged for 2 years for the best flavour.",
      price: 599,
      comparePrice: 750,
      images: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80",
      ],
      stock: 150,
      sku: "AGR-RICE-001",
      weight: 5.0,
      tags: ["rice", "basmati", "organic", "staple", "grocery"],
      isFeatured: true,
      isBestSeller: true,
      pincode: "302001",
      city: "Jaipur",
      avgRating: 4.7,
      reviewCount: 143,
      salesCount: 892,
      viewCount: 3400,
    },
    {
      sellerId: ramesh.shopId,
      categoryId: catMap["groceries-kirana"],
      name: "Cold-Pressed Groundnut Oil 1L",
      slug: "cold-pressed-groundnut-oil-1l",
      description: "Traditional wooden-press (ghani) extracted groundnut oil. Rich in natural flavour, high smoke point, perfect for Indian cooking. No chemicals or additives. Sourced directly from Rajasthani farms.",
      price: 299,
      comparePrice: 350,
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      ],
      stock: 80,
      sku: "AGR-OIL-001",
      weight: 1.0,
      tags: ["oil", "groundnut", "cold-pressed", "cooking", "natural"],
      isBestSeller: true,
      pincode: "302001",
      city: "Jaipur",
      avgRating: 4.5,
      reviewCount: 87,
      salesCount: 456,
      viewCount: 1800,
    },
    {
      sellerId: ramesh.shopId,
      categoryId: catMap["groceries-kirana"],
      name: "Organic Turmeric Powder 500g",
      slug: "organic-turmeric-powder-500g",
      description: "Pure organic turmeric powder from Rajasthan's renowned Lakadong variety. High curcumin content (5-7%). No artificial colours or preservatives. Lab-tested and certified organic.",
      price: 180,
      comparePrice: 240,
      images: [
        "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80",
        "https://images.unsplash.com/photo-1610374792793-f016b77ca51a?w=800&q=80",
      ],
      stock: 200,
      sku: "AGR-SPICE-001",
      weight: 0.5,
      tags: ["turmeric", "spices", "organic", "haldi", "ayurveda"],
      isFeatured: true,
      pincode: "302001",
      city: "Jaipur",
      avgRating: 4.8,
      reviewCount: 201,
      salesCount: 1100,
      viewCount: 4200,
    },

    // ── Handmade Crafts (Meera)
    {
      sellerId: meera.shopId,
      categoryId: catMap["handmade-crafts"],
      name: "Hand-painted Tanjore Silk Saree",
      slug: "hand-painted-tanjore-silk-saree",
      description: "Exquisite hand-painted pure silk saree featuring traditional Tanjore art motifs. Each saree is a unique piece of art, crafted by master artisans from Tamil Nadu. 6 metres with running blouse piece. Perfect for festivals and special occasions.",
      price: 8500,
      comparePrice: 12000,
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
        "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=800&q=80",
      ],
      stock: 12,
      sku: "MCH-SAREE-001",
      weight: 0.8,
      tags: ["saree", "silk", "tanjore", "handmade", "art", "traditional"],
      isFeatured: true,
      isBestSeller: true,
      pincode: "600001",
      city: "Chennai",
      avgRating: 4.9,
      reviewCount: 58,
      salesCount: 234,
      viewCount: 5600,
    },
    {
      sellerId: meera.shopId,
      categoryId: catMap["handmade-crafts"],
      name: "Terracotta Planter Set (Set of 3)",
      slug: "terracotta-planter-set-3",
      description: "Beautifully hand-sculpted terracotta planters with intricate geometric engravings. Suitable for indoor and outdoor plants. Natural clay ensures excellent drainage. Includes drainage hole and tray. Each set is unique.",
      price: 1200,
      comparePrice: 1800,
      images: [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
        "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=800&q=80",
      ],
      stock: 35,
      sku: "MCH-PLANT-001",
      weight: 2.5,
      tags: ["terracotta", "planters", "handmade", "home-decor", "pottery"],
      isBestSeller: true,
      pincode: "600001",
      city: "Chennai",
      avgRating: 4.6,
      reviewCount: 92,
      salesCount: 318,
      viewCount: 2800,
    },
    {
      sellerId: meera.shopId,
      categoryId: catMap["handmade-crafts"],
      name: "Macramé Wall Hanging – Bohemian Sunrise",
      slug: "macrame-wall-hanging-bohemian-sunrise",
      description: "Large hand-knotted macramé wall art in natural cotton rope. Size: 60cm x 90cm. Boho aesthetic with intricate knotting patterns and fringe detailing. Adds warmth and texture to any room. Handcrafted to order.",
      price: 2200,
      comparePrice: 2800,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        "https://images.unsplash.com/photo-1605300928675-2e73d57d9f47?w=800&q=80",
      ],
      stock: 20,
      sku: "MCH-WALL-001",
      weight: 0.6,
      tags: ["macrame", "wall-art", "boho", "handmade", "decor", "cotton"],
      isFeatured: true,
      pincode: "600001",
      city: "Chennai",
      avgRating: 4.8,
      reviewCount: 44,
      salesCount: 187,
      viewCount: 3100,
    },

    // ── Electronics (Sunil)
    {
      sellerId: sunil.shopId,
      categoryId: catMap["electronics"],
      name: "Wireless Noise-Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description: "Premium over-ear headphones with 40dB active noise cancellation, 30-hour battery life, and Hi-Res audio certification. Bluetooth 5.3, multipoint connection. Foldable design with memory foam ear cushions. Includes carry case and USB-C cable.",
      price: 4999,
      comparePrice: 7999,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      ],
      stock: 45,
      sku: "TEC-HEAD-001",
      weight: 0.35,
      tags: ["headphones", "wireless", "noise-cancelling", "audio", "bluetooth"],
      isFeatured: true,
      isBestSeller: true,
      pincode: "500001",
      city: "Hyderabad",
      avgRating: 4.6,
      reviewCount: 312,
      salesCount: 1456,
      viewCount: 8900,
    },
    {
      sellerId: sunil.shopId,
      categoryId: catMap["electronics"],
      name: "10000mAh Slim Power Bank",
      slug: "10000mah-slim-power-bank",
      description: "Ultra-slim 12mm profile power bank with 10000mAh capacity. Supports 22.5W fast charging for your phone and 15W output for other devices. Dual USB-A + USB-C ports. LED indicator. Airline approved. Charges iPhone 15 3x.",
      price: 1299,
      comparePrice: 1999,
      images: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
      ],
      stock: 120,
      sku: "TEC-PWR-001",
      weight: 0.22,
      tags: ["power-bank", "portable-charger", "fast-charge", "electronics", "travel"],
      isBestSeller: true,
      pincode: "500001",
      city: "Hyderabad",
      avgRating: 4.4,
      reviewCount: 489,
      salesCount: 2340,
      viewCount: 12000,
    },
    {
      sellerId: sunil.shopId,
      categoryId: catMap["electronics"],
      name: "Smart LED Desk Lamp with USB Charging",
      slug: "smart-led-desk-lamp-usb-charging",
      description: "Architect-style LED desk lamp with 5 color temperatures and 5 brightness levels. Built-in USB-A and USB-C charging ports. 10W LED, 800 lumens, eye-care certified. Touch controls, memory function, timer. Perfect for study and work.",
      price: 2199,
      comparePrice: 3499,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        "https://images.unsplash.com/photo-1573297888049-e7e0fde5c64a?w=800&q=80",
      ],
      stock: 67,
      sku: "TEC-LAMP-001",
      weight: 0.95,
      tags: ["desk-lamp", "LED", "smart", "USB", "study", "work"],
      isFeatured: true,
      pincode: "500001",
      city: "Hyderabad",
      avgRating: 4.5,
      reviewCount: 178,
      salesCount: 876,
      viewCount: 5400,
    },

    // ── Beauty (Lakshmi)
    {
      sellerId: lakshmi.shopId,
      categoryId: catMap["beauty-wellness"],
      name: "Ayurvedic Face Glow Kit",
      slug: "ayurvedic-face-glow-kit",
      description: "Complete 5-piece Ayurvedic skincare routine kit. Includes: Rose Water Toner (100ml), Kumkumadi Brightening Serum (30ml), Turmeric Face Mask (75g), Neem Face Wash (100ml), and Aloe Vera Gel (150g). All natural, dermatologist tested.",
      price: 1599,
      comparePrice: 2200,
      images: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      ],
      stock: 55,
      sku: "KOB-FACE-001",
      weight: 0.55,
      tags: ["skincare", "ayurvedic", "face-glow", "natural", "beauty", "kit"],
      isFeatured: true,
      isBestSeller: true,
      pincode: "682001",
      city: "Kochi",
      avgRating: 4.8,
      reviewCount: 267,
      salesCount: 1234,
      viewCount: 7800,
    },
    {
      sellerId: lakshmi.shopId,
      categoryId: catMap["beauty-wellness"],
      name: "Virgin Coconut Oil Hair Mask",
      slug: "virgin-coconut-oil-hair-mask",
      description: "Deep conditioning hair mask with cold-pressed virgin coconut oil, hibiscus extract, curry leaves, and amla. Reverses damage, reduces frizz, promotes hair growth. 200g. Use 2x weekly for best results. Free of sulphates and parabens.",
      price: 399,
      comparePrice: 549,
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80",
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80",
      ],
      stock: 90,
      sku: "KOB-HAIR-001",
      weight: 0.22,
      tags: ["hair-mask", "coconut-oil", "haircare", "natural", "organic"],
      isBestSeller: true,
      pincode: "682001",
      city: "Kochi",
      avgRating: 4.7,
      reviewCount: 398,
      salesCount: 2100,
      viewCount: 9200,
    },

    // ── Fashion (Arjun)
    {
      sellerId: arjun.shopId,
      categoryId: catMap["fashion"],
      name: "Bandhani Print Cotton Kurta",
      slug: "bandhani-print-cotton-kurta",
      description: "Authentic Gujarati bandhani (tie-dye) kurta in pure hand-woven cotton. Each piece is unique with natural dyes. Available in S/M/L/XL. Comfortable for daily wear and casual gatherings. Machine washable. Comes with a matching pocket square.",
      price: 1450,
      comparePrice: 2000,
      images: [
        "https://images.unsplash.com/photo-1620065404955-d3d36eb3ded0?w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
      ],
      stock: 40,
      sku: "AFB-KURTA-001",
      weight: 0.3,
      tags: ["kurta", "bandhani", "cotton", "traditional", "Gujarat", "ethnic"],
      isFeatured: true,
      isBestSeller: true,
      pincode: "380001",
      city: "Ahmedabad",
      avgRating: 4.6,
      reviewCount: 124,
      salesCount: 567,
      viewCount: 4300,
    },
    {
      sellerId: arjun.shopId,
      categoryId: catMap["fashion"],
      name: "Block Print Linen Dress",
      slug: "block-print-linen-dress",
      description: "Hand block-printed 100% linen midi dress with a relaxed silhouette. Floral Dabu print from Bagru, Rajasthan. Button-down front, pockets, adjustable belt. Breathable and perfect for summers. Available in S/M/L/XL/XXL.",
      price: 2800,
      comparePrice: 3800,
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
      ],
      stock: 28,
      sku: "AFB-DRESS-001",
      weight: 0.35,
      tags: ["dress", "linen", "block-print", "summer", "boho", "midi"],
      isFeatured: true,
      pincode: "380001",
      city: "Ahmedabad",
      avgRating: 4.7,
      reviewCount: 88,
      salesCount: 312,
      viewCount: 3900,
    },
    {
      sellerId: arjun.shopId,
      categoryId: catMap["fashion"],
      name: "Embroidered Mojari Shoes (Pair)",
      slug: "embroidered-mojari-shoes",
      description: "Handcrafted genuine leather mojari with intricate zari embroidery. Traditional Jodhpuri craftsmanship. Cushioned insole for comfort. Available in sizes 6-11 (Men) and 4-9 (Women). Perfect for ethnic occasions and festive wear.",
      price: 1800,
      comparePrice: 2500,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=800&q=80",
      ],
      stock: 50,
      sku: "AFB-SHOE-001",
      weight: 0.6,
      tags: ["mojari", "shoes", "handmade", "leather", "ethnic", "embroidered"],
      isBestSeller: true,
      pincode: "380001",
      city: "Ahmedabad",
      avgRating: 4.5,
      reviewCount: 156,
      salesCount: 689,
      viewCount: 5100,
    },

    // ── Food & Beverages (Divya)
    {
      sellerId: divya.shopId,
      categoryId: catMap["food-beverages"],
      name: "Assorted Homemade Pickle Trio",
      slug: "assorted-homemade-pickle-trio",
      description: "A curated set of 3 authentic homemade pickles: Raw Mango (200g), Mixed Vegetable (200g), and Green Chilli & Garlic (200g). Made with cold-pressed mustard oil, hand-ground spices, and sun-dried ingredients. No preservatives. Shelf life: 6 months.",
      price: 449,
      comparePrice: 600,
      images: [
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      ],
      stock: 75,
      sku: "DHF-PICKLE-001",
      weight: 0.65,
      tags: ["pickle", "homemade", "achar", "mango", "traditional", "no-preservatives"],
      isFeatured: true,
      pincode: "411001",
      city: "Pune",
      avgRating: 4.9,
      reviewCount: 312,
      salesCount: 1560,
      viewCount: 6700,
    },
    {
      sellerId: divya.shopId,
      categoryId: catMap["food-beverages"],
      name: "Artisan Masala Chai Blend 250g",
      slug: "artisan-masala-chai-blend-250g",
      description: "Hand-blended loose-leaf masala chai with premium Assam CTC tea, whole spices (cardamom, cinnamon, ginger, cloves, black pepper, and star anise). Aromatic and full-bodied. Makes 100 cups. Compostable packaging.",
      price: 299,
      comparePrice: 399,
      images: [
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
        "https://images.unsplash.com/photo-1527549993586-dff825b37782?w=800&q=80",
      ],
      stock: 100,
      sku: "DHF-CHAI-001",
      weight: 0.28,
      tags: ["chai", "masala", "tea", "artisan", "spiced", "loose-leaf"],
      isBestSeller: true,
      pincode: "411001",
      city: "Pune",
      avgRating: 4.8,
      reviewCount: 445,
      salesCount: 2890,
      viewCount: 11000,
    },

    // ── Home & Kitchen (Meera)
    {
      sellerId: meera.shopId,
      categoryId: catMap["home-kitchen"],
      name: "Handwoven Dhurrie Rug 3x5ft",
      slug: "handwoven-dhurrie-rug-3x5ft",
      description: "Flat-woven cotton dhurrie rug in earthy geometric patterns. 100% natural cotton, hand-woven by artisans in Rajasthan. Size: 90cm x 150cm. Reversible, easy to clean, lightweight. Adds a bohemian touch to living rooms, bedrooms, or hallways.",
      price: 3200,
      comparePrice: 4500,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      ],
      stock: 18,
      sku: "MCH-RUG-001",
      weight: 1.8,
      tags: ["rug", "dhurrie", "handwoven", "cotton", "home-decor", "boho"],
      isFeatured: true,
      pincode: "600001",
      city: "Chennai",
      avgRating: 4.7,
      reviewCount: 76,
      salesCount: 234,
      viewCount: 3200,
    },
  ];

  const products = await Promise.all(
    productsData.map((p) => prisma.product.create({ data: p }))
  );
  console.log(`✅ Created ${products.length} products.\n`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  console.log("⭐ Creating reviews...");
  const reviewsData = [
    // Buyer 1 (Priya) reviews
    { userId: buyers[0].id, productId: products[0].id, rating: 5, comment: "The basmati rice is absolutely fragrant and cooks perfectly. Has been my go-to brand for the last 3 months!", isVerified: true },
    { userId: buyers[0].id, productId: products[6].id, rating: 4, comment: "Great noise cancellation, very comfortable for long work sessions. Battery life is impressive.", isVerified: true },
    { userId: buyers[0].id, productId: products[9].id, rating: 5, comment: "The glow kit is amazing! My skin feels so much smoother after just 2 weeks. Highly recommend the kumkumadi serum.", isVerified: true },
    // Buyer 2 (Rahul) reviews
    { userId: buyers[1].id, productId: products[3].id, rating: 5, comment: "This saree is a masterpiece! My wife wore it to a wedding and got so many compliments. Worth every rupee.", isVerified: true },
    { userId: buyers[1].id, productId: products[7].id, rating: 4, comment: "Fast charging, slim and lightweight. Charged my OnePlus completely while traveling. Good value.", isVerified: true },
    { userId: buyers[1].id, productId: products[15].id, rating: 5, comment: "The masala chai blend is heavenly! Just the right amount of spice. My morning ritual is now complete.", isVerified: true },
    // Buyer 3 (Ananya) reviews
    { userId: buyers[2].id, productId: products[4].id, rating: 5, comment: "Beautiful terracotta planters! They look stunning with my monstera and succulents. Great drainage holes.", isVerified: true },
    { userId: buyers[2].id, productId: products[10].id, rating: 5, comment: "Kerala organics coconut oil mask transformed my hair! No more frizz. Love that it's chemical-free.", isVerified: true },
    { userId: buyers[2].id, productId: products[11].id, rating: 5, comment: "The bandhani kurta is beautiful! Soft cotton, lovely colours, and fits perfectly. Got many compliments!", isVerified: true },
  ];

  await prisma.review.createMany({ data: reviewsData });
  console.log(`✅ Created ${reviewsData.length} reviews.\n`);

  // ── Carts ─────────────────────────────────────────────────────────────────
  console.log("🛒 Creating carts...");
  const cart1 = await prisma.cart.create({
    data: {
      userId: buyers[0].id,
      items: {
        create: [
          { productId: products[0].id, quantity: 2 },
          { productId: products[6].id, quantity: 1 },
        ],
      },
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      userId: buyers[1].id,
      items: {
        create: [
          { productId: products[9].id, quantity: 1 },
          { productId: products[14].id, quantity: 3 },
        ],
      },
    },
  });

  const cart3 = await prisma.cart.create({
    data: {
      userId: buyers[2].id,
      items: {
        create: [
          { productId: products[11].id, quantity: 1 },
          { productId: products[4].id, quantity: 2 },
        ],
      },
    },
  });
  console.log("✅ Carts created.\n");

  // ── Wishlists ─────────────────────────────────────────────────────────────
  console.log("❤️  Creating wishlists...");
  await prisma.wishlist.create({
    data: {
      userId: buyers[0].id,
      items: {
        create: [
          { productId: products[3].id },
          { productId: products[12].id },
          { productId: products[16].id },
        ],
      },
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: buyers[1].id,
      items: {
        create: [
          { productId: products[6].id },
          { productId: products[8].id },
        ],
      },
    },
  });
  console.log("✅ Wishlists created.\n");

  // ── Orders ────────────────────────────────────────────────────────────────
  console.log("📋 Creating orders...");

  // Order 1: Delivered (Priya - Rice + Headphones)
  const order1 = await prisma.order.create({
    data: {
      userId: buyers[0].id,
      razorpayOrderId: "order_test_001",
      razorpayPaymentId: "pay_test_001",
      razorpaySignature: "sig_test_001",
      status: OrderStatus.DELIVERED,
      paymentStatus: PayStatus.PAID,
      subtotal: 1198,
      deliveryCharge: 49,
      commission: 120,
      total: 1247,
      shippingName: "Priya Sharma",
      shippingPhone: "9811234567",
      shippingAddress: "A-12, Model Town, North Delhi",
      shippingPincode: "110009",
      shippingCity: "Delhi",
      shippingState: "Delhi",
      createdAt: daysAgo(45),
      items: {
        create: [
          {
            productId: products[0].id,
            sellerId: ramesh.shopId,
            quantity: 2,
            price: 599,
            status: ItemStatus.DELIVERED,
          },
        ],
      },
    },
  });

  // Order 2: Shipped (Rahul - Saree)
  const order2 = await prisma.order.create({
    data: {
      userId: buyers[1].id,
      razorpayOrderId: "order_test_002",
      razorpayPaymentId: "pay_test_002",
      razorpaySignature: "sig_test_002",
      status: OrderStatus.SHIPPED,
      paymentStatus: PayStatus.PAID,
      subtotal: 8500,
      deliveryCharge: 0,
      commission: 850,
      total: 8500,
      shippingName: "Rahul Mehta",
      shippingPhone: "9822345678",
      shippingAddress: "204, Sea View Apartments, Bandra West",
      shippingPincode: "400050",
      shippingCity: "Mumbai",
      shippingState: "Maharashtra",
      createdAt: daysAgo(5),
      items: {
        create: [
          {
            productId: products[3].id,
            sellerId: meera.shopId,
            quantity: 1,
            price: 8500,
            status: ItemStatus.SHIPPED,
          },
        ],
      },
    },
  });

  // Order 3: Delivered with Refund (Ananya - Headphones)
  const order3 = await prisma.order.create({
    data: {
      userId: buyers[2].id,
      razorpayOrderId: "order_test_003",
      razorpayPaymentId: "pay_test_003",
      razorpaySignature: "sig_test_003",
      status: OrderStatus.REFUNDED,
      paymentStatus: PayStatus.REFUNDED,
      subtotal: 4999,
      deliveryCharge: 49,
      commission: 500,
      total: 5048,
      shippingName: "Ananya Singh",
      shippingPhone: "9833456789",
      shippingAddress: "15, Indiranagar 100ft Road",
      shippingPincode: "560038",
      shippingCity: "Bangalore",
      shippingState: "Karnataka",
      createdAt: daysAgo(20),
      items: {
        create: [
          {
            productId: products[6].id,
            sellerId: sunil.shopId,
            quantity: 1,
            price: 4999,
            status: ItemStatus.DELIVERED,
          },
        ],
      },
    },
  });

  // Order 4: Processing (Priya - Beauty Kit)
  await prisma.order.create({
    data: {
      userId: buyers[0].id,
      razorpayOrderId: "order_test_004",
      razorpayPaymentId: "pay_test_004",
      razorpaySignature: "sig_test_004",
      status: OrderStatus.PROCESSING,
      paymentStatus: PayStatus.PAID,
      subtotal: 1599,
      deliveryCharge: 49,
      commission: 160,
      total: 1648,
      shippingName: "Priya Sharma",
      shippingPhone: "9811234567",
      shippingAddress: "A-12, Model Town, North Delhi",
      shippingPincode: "110009",
      shippingCity: "Delhi",
      shippingState: "Delhi",
      createdAt: daysAgo(2),
      items: {
        create: [
          {
            productId: products[9].id,
            sellerId: lakshmi.shopId,
            quantity: 1,
            price: 1599,
            status: ItemStatus.PROCESSING,
          },
        ],
      },
    },
  });

  // Order 5: Confirmed (Rahul - Chai + Pickle)
  await prisma.order.create({
    data: {
      userId: buyers[1].id,
      razorpayOrderId: "order_test_005",
      razorpayPaymentId: "pay_test_005",
      razorpaySignature: "sig_test_005",
      status: OrderStatus.CONFIRMED,
      paymentStatus: PayStatus.PAID,
      subtotal: 748,
      deliveryCharge: 49,
      commission: 75,
      total: 797,
      shippingName: "Rahul Mehta",
      shippingPhone: "9822345678",
      shippingAddress: "204, Sea View Apartments, Bandra West",
      shippingPincode: "400050",
      shippingCity: "Mumbai",
      shippingState: "Maharashtra",
      createdAt: daysAgo(1),
      items: {
        create: [
          {
            productId: products[14].id,
            sellerId: divya.shopId,
            quantity: 1,
            price: 449,
            status: ItemStatus.CONFIRMED,
          },
          {
            productId: products[15].id,
            sellerId: divya.shopId,
            quantity: 1,
            price: 299,
            status: ItemStatus.CONFIRMED,
          },
        ],
      },
    },
  });

  console.log("✅ Orders created.\n");

  // ── Refund ────────────────────────────────────────────────────────────────
  console.log("💸 Creating refund...");
  await prisma.refund.create({
    data: {
      orderId: order3.id,
      reason: "The headphones developed an issue with the left ear audio after 5 days of use. The noise cancellation stopped working properly.",
      amount: 5048,
      status: RefundStatus.PROCESSED,
      processedAt: daysAgo(12),
    },
  });
  console.log("✅ Refund created.\n");

  // ── Browsing History ──────────────────────────────────────────────────────
  console.log("👁️  Creating browsing history...");
  const browsingData = [
    { userId: buyers[0].id, productId: products[0].id, viewedAt: daysAgo(10) },
    { userId: buyers[0].id, productId: products[1].id, viewedAt: daysAgo(9) },
    { userId: buyers[0].id, productId: products[2].id, viewedAt: daysAgo(8) },
    { userId: buyers[0].id, productId: products[6].id, viewedAt: daysAgo(7) },
    { userId: buyers[0].id, productId: products[9].id, viewedAt: daysAgo(5) },
    { userId: buyers[0].id, productId: products[11].id, viewedAt: daysAgo(3) },
    { userId: buyers[1].id, productId: products[3].id, viewedAt: daysAgo(12) },
    { userId: buyers[1].id, productId: products[4].id, viewedAt: daysAgo(11) },
    { userId: buyers[1].id, productId: products[5].id, viewedAt: daysAgo(10) },
    { userId: buyers[1].id, productId: products[14].id, viewedAt: daysAgo(6) },
    { userId: buyers[1].id, productId: products[15].id, viewedAt: daysAgo(4) },
    { userId: buyers[2].id, productId: products[6].id, viewedAt: daysAgo(25) },
    { userId: buyers[2].id, productId: products[7].id, viewedAt: daysAgo(20) },
    { userId: buyers[2].id, productId: products[9].id, viewedAt: daysAgo(18) },
    { userId: buyers[2].id, productId: products[10].id, viewedAt: daysAgo(15) },
    { userId: buyers[2].id, productId: products[12].id, viewedAt: daysAgo(10) },
    { userId: buyers[2].id, productId: products[16].id, viewedAt: daysAgo(5) },
  ];
  await prisma.browsingHistory.createMany({ data: browsingData });
  console.log("✅ Browsing history created.\n");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 VendorHub seed complete!\n");
  console.log("📊 Summary:");
  console.log(`   👑 Admin:      1  (admin@vendorhub.in / Admin@123)`);
  console.log(`   🛍️  Buyers:     ${buyers.length}  (priya/rahul/ananya@example.com / Buyer@123)`);
  console.log(`   🏪 Sellers:    ${sellers.length}  (*@kirana.in etc. / Seller@123)`);
  console.log(`   📂 Categories: ${categories.length}`);
  console.log(`   📦 Products:   ${products.length}`);
  console.log(`   ⭐ Reviews:    ${reviewsData.length}`);
  console.log(`   📋 Orders:     5`);
  console.log(`   💸 Refunds:    1`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
