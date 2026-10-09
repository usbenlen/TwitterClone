import type { User } from "@/types/user";

export type BackendUser<T extends { role?: User["role"] }> = Omit<T, "role"> & {
  role?: string | null;
};

export function normalizeUserRole(role: unknown): User["role"] {
  if (role === "Admin" || role === "ADMIN") return "Admin";
  if (role === "User" || role === "USER") return "User";
  return undefined;
}

export function mapUserRole<T extends { role?: string | null }>(
  user: T,
): Omit<T, "role"> & { role?: User["role"] } {
  return { ...user, role: normalizeUserRole(user.role) };
}
