import type {
  ReportDecision,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/types/report";

export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: "Спам",
  harassment: "Образи або переслідування",
  misinformation: "Недостовірна інформація",
  violence: "Насильство",
  hate: "Мова ворожнечі",
  other: "Інше",
};
export const REPORT_STATUSES: Record<ReportStatus, string> = {
  pending: "На перевірці",
  resolved: "Завершено",
};
export const REPORT_DECISIONS: Record<ReportDecision, string> = {
  kept: "Залишено",
  deleted: "Видалено",
  blocked: "Заблоковано",
};
export const REPORT_TARGETS: Record<ReportTargetType, string> = {
  posts: "Дописи",
  comments: "Коментарі",
  users: "Користувачі",
};
