import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { resolveUserRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const role = resolveUserRole(user.email);

      await prisma.user.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role,
        },
        update: {
          name: user.name ?? null,
          image: user.image ?? null,
          role,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = resolveUserRole(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      session.user.role =
        (token.role as UserRole | undefined) ?? UserRole.USER;
      return session;
    },
  },
};
