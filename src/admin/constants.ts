import {
  Lock,
  ChartNoAxesCombined,
  Check,
  Flag,
  Settings,
  Unlock,
  Trash2,
  UsersRound,
} from "lucide-react";
import { APP_ROUTES } from "@/constants/routes";
import type { ModerationParams, UsersParams } from "@/admin/types";
import type { ReportDecision } from "@/types/report";

export const ADMIN_PAGE_SIZE = 10;
export const DASHBOARD_TABLE_LIMIT = 5;
export const ADMIN_NAVIGATION = [
  { label: "Огляд", to: APP_ROUTES.ADMIN, icon: ChartNoAxesCombined },
  { label: "Користувачі", to: APP_ROUTES.ADMIN_USERS, icon: UsersRound },
  { label: "Модерація", to: APP_ROUTES.ADMIN_MODERATION, icon: Flag },
  { label: "Налаштування", to: APP_ROUTES.ADMIN_SETTINGS, icon: Settings },
];
export const USERS_DEFAULTS: UsersParams = {
  page: 1,
  search: "",
  sort: "newest",
  status: "all",
};
export const MODERATION_DEFAULTS: ModerationParams = {
  page: 1,
  search: "",
  sort: "newest",
  type: "all",
  source: "all",
  status: "all",
  decision: "all",
};
export const USER_ACTION_LABELS = {
  block: "Заблокувати",
  unblock: "Розблокувати",
  delete: "Видалити",
} as const;
export const USER_ACTION_ICONS = {
  block: Lock,
  unblock: Unlock,
  delete: Trash2,
} as const;
export const REPORT_ACTION_LABELS: Record<ReportDecision, string> = {
  kept: "Залишити",
  deleted: "Видалити",
  blocked: "Заблокувати",
};
export const REPORT_ACTION_ICONS = {
  kept: Check,
  deleted: Trash2,
  blocked: Lock,
} as const;
