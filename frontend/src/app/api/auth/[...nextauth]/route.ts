import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        // Yeh call aapke Rust backend ko jayegi
        try {
          const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              otp: credentials?.otp,
            }),
          });
          
          if (res.ok) {
            const user = await res.json();
            return user; // Return the user object from Rust
          }
          return null;
        } catch (error) {
          console.error("Rust backend is not running yet", error);
          
          // MOCK SUCCESS FOR NOW (Kyuki Rust backend abhi bana nahi hai)
          if (credentials?.email && credentials?.otp === "123456") {
            return { id: "1", name: "VIP Client", email: credentials.email };
          }
          
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Agar Google se login kiya hai, toh Rust mein save kar lo
      if (account?.provider === "google") {
        try {
          await fetch("http://localhost:8000/api/auth/google-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });
        } catch (error) {
          console.log("Mocking Google Sync to Rust");
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // You can attach custom IDs from Rust here
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
