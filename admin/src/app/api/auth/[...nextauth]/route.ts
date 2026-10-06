import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "raani-closet-secret",
  callbacks: {
    async signIn({ user }) {
      // Only allow whitelisted emails
      const allowed = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      if (!user.email || !allowed.includes(user.email.toLowerCase())) {
        return false; // block unauthorized emails
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      return "/";
    },
  },
  events: {
    async signIn({ user }) {
      // When Google login succeeds, also set our cookie for middleware compatibility
      // This is handled via a redirect — see the custom callback below
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
