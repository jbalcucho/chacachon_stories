import { UserRole } from "@prisma/client";

export function getConfiguredAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveUserRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  return getConfiguredAdminEmails().includes(normalized)
    ? UserRole.ADMIN
    : UserRole.USER;
}

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === UserRole.ADMIN;
}
