import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as any).role;
        token.sellerStatus = (user as any).sellerStatus;
        token.sellerId = (user as any).sellerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.sellerStatus = token.sellerStatus as string | null;
        session.user.sellerId = token.sellerId as string | null;
      }
      return session;
    },
  },
});
