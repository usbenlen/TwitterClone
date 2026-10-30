import type { BackendPost } from "@/features/content/types";
import type { AdminUser } from "@/features/moderation/types/admin";
import type { ReportSignal } from "@/features/moderation/types/report";
import type { BackendUser } from "@/features/profiles/types";

export type BackendReport = Omit<ReportSignal, "target"> & {
  target:
    | { type: "users"; data: BackendUser<AdminUser> }
    | { type: "posts" | "comments"; data: BackendPost }
    | null;
};
