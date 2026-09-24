import { sampleAuthors } from "@/mock/data";
import type { User } from "@/types";
import { delay } from "@/mock/utils/delay";

export const mockUserApi = {
  async getAll(): Promise<User[]> {
    await delay(200);
    return [...sampleAuthors];
  },

  async toggleBan(id: string, isBanned: boolean): Promise<User> {
    await delay(300);

    const user = sampleAuthors.find((u) => u.id === id);
    if (!user) throw new Error("Користувача не знайдено.");

    (user as any).isBanned = isBanned;

    return { ...user };
  },

  async changeRole(id: string, role: "USER" | "ADMIN"): Promise<User> {
    await delay(300);

    const user = sampleAuthors.find((u) => u.id === id);
    if (!user) throw new Error("Користувача не знайдено.");

    (user as any).role = role;

    return { ...user };
  }
};