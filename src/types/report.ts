import type { Tweet } from "@/types/tweet";
import type { User } from "@/types/user";

export type ReportTargetType = "posts" | "comments" | "users";
export type ReportReason = "spam" | "harassment" | "misinformation" | "violence" | "hate" | "other";
export type ReportDecision = "kept" | "deleted" | "blocked";
export type ReportStatus = "pending" | "resolved";
export type ReportSource = "user" | "system";
export type ReportTarget = { type: "users"; data: User } | { type: "posts" | "comments"; data: Tweet };

export interface ReportSignal {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  target: ReportTarget | null;
  source: ReportSource;
  status: ReportStatus;
  decision?: ReportDecision;
  reason: ReportReason;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: { id: string; username: string };
  reporter?: { id: string; username: string };
  system?: { code: string; label: string };
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
}
