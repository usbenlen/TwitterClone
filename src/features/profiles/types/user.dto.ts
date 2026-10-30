import type { User } from "@/features/profiles/types/user";

export type BackendUser<T extends { role?: User["role"] }> = Omit<T, "role"> & {
  role?: string | null;
};
