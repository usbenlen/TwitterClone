import type { User } from "@/types/user";

export type BackendUser<T extends { role?: User["role"] }> = Omit<T, "role"> & {
  role?: string | null;
};
