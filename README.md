# 🏪 VendorHub — Hyperlocal Multi-Vendor Marketplace with AI Intel

**VendorHub** is a next-generation hyperlocal e-commerce platform designed to bring neighborhood storefronts online. It provides distinct tailored experiences for **Buyers**, **Sellers (Vendors)**, and **Administrators**, powered by intelligent **Gemini AI** capabilities, secure escrow sandbox checkout, and a high-fidelity glassmorphic visual aesthetic.

---

## 🚀 Key Features

### 🧠 Gemini AI Integration
* **Semantic Intelligent Search**: Interprets natural search phrases, maps intents to categories, extracts synonyms, and returns matches regardless of exact naming (e.g. searching "laptop bag" semantic matches "notebook carry case").
* **Smart Pricing Suggestion**: Analyzes competitor prices in the database to recommend competitive listing prices and discount comparative metrics with natural reasoning notes.
* **Personalized Product Feed**: Builds recommendation grids tailored to the buyer's actual browsing history and past transaction items.

### 👥 Multi-Role User Workflows
* **Buyer**:
  * Category and Pincode filtering.
  * Easy cart, wishlist, and shipping address management.
  * Real-time order tracking steps (`Placed` → `Confirmed` → `Processing` → `Shipped` → `Delivered`).
  * Simple sandbox payment checkout with escrow safety flags.
  * Verified delivery review forms and refund requests.
* **Seller (Vendor)**:
  * Application forms for registration (pending administrator activation).
  * Product listing creation with image uploads and AI pricing tools.
  * Order fulfillment queue management (Processing, Shipping, Delivering, Cancelling).
  * Ledger displays for completed payouts and pending settlements.
* **Platform Administrator**:
  * Core Platform volume, commission, active orders, and vendor statistics.
  * Action controls to approve/reject vendor sign-ups and buyer refunds.
  * Interactive platform configuration settings (commission rates).

---

## 🛠️ Tech Stack & Architecture

* **Framework**: Next.js (App Router, Server Actions)
* **Styling**: Tailwind CSS, Lucide Icons, Glassmorphic & Mesh Gradient Overlays
* **Database**: Prisma ORM, PostgreSQL / SQLite
* **State Management**: Zustand
* **AI engine**: Gemini Pro (via `@google/generative-ai` API integration)
* **Notifications**: Sonner rich toast notifications
* **Validations**: React Hook Form with Zod schema verification

---

## ⚙️ Quick Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <your-repo-link>
   cd vendorhub
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db" # Database connection string
   GEMINI_API_KEY="AIzaSy..."  # Your Google Gemini API Key
   NEXTAUTH_SECRET="your-session-secret-hash"
   ```

4. **Initialize Database Schema**:
   ```bash
   npx prisma db push
   npx prisma db seed # If seed scripts are configured
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to browse.

---

## 🏆 Submission Documents
* **Project Writeup**: Refer to [project_writeup.md](file:///C:/Users/HP/.gemini/antigravity-ide/brain/7aab0e31-d6f2-492c-8db1-a7377fde871a/project_writeup.md).
* **Code Walkthrough**: Refer to [walkthrough.md](file:///C:/Users/HP/.gemini/antigravity-ide/brain/7aab0e31-d6f2-492c-8db1-a7377fde871a/walkthrough.md).
