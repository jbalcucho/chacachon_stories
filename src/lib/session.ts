import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  if (session.user?.id) {
    return {
      id: session.user.id,
      email,
      role: session.user.role ?? UserRole.USER,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    email,
    role: session.user?.role ?? user.role,
  };
}

export async function getSessionUserId(): Promise<string | null> {
  return (await getSessionUser())?.id ?? null;
}

export async function requireSessionUser(): Promise<SessionUser | null> {
  return getSessionUser();
}
