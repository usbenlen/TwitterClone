import type { BackendPost } from "@/types/post.dto";
import type { BackendUser } from "@/types/user.dto";
import type { AdminUser } from "@/types/admin";
import type { ReportSignal } from "@/types/report";

export type BackendReport = Omit<ReportSignal, "target"> & {
  target:
    | { type: "users"; data: BackendUser<AdminUser> }
    | { type: "posts" | "comments"; data: BackendPost }
    | null;
};
