import {
  Bell,
  Bookmark,
  House,
  Search,
  Settings,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

import { APP_ROUTES } from "@/shared/config/routes";

import type { ComponentType } from "react";
import type { User } from "@/features/profiles/types";

export interface DesktopNavigationItem {
  label: string;
  icon: ComponentType;
  getPath: (user?: User | null) => string;
  requiresAuth?: boolean;
  mobilePlacement?: Array<"bottom" | "more">;
}

export const MAIN_NAVIGATION: DesktopNavigationItem[] = [
  {
    label: "Головна",
    icon: House,
    getPath: () => APP_ROUTES.HOME,
    requiresAuth: true,
    mobilePlacement: ["bottom", "more"],
  },
  {
    label: "Дослідження",
    icon: Search,
    getPath: () => APP_ROUTES.EXPLORE,
    requiresAuth: true,
    mobilePlacement: ["more"],
  },
  {
    label: "Сповіщення",
    icon: Bell,
    getPath: () => APP_ROUTES.NOTIFICATIONS,
    requiresAuth: true,
    mobilePlacement: ["bottom", "more"],
  },
  {
    label: "Профіль",
    icon: UserRound,
    getPath: (user) =>
      user ? APP_ROUTES.profile(user.username) : APP_ROUTES.HOME,
    requiresAuth: true,
    mobilePlacement: ["bottom", "more"],
  },
  {
    label: "Закладки",
    icon: Bookmark,
    getPath: () => APP_ROUTES.BOOKMARKS,
    requiresAuth: true,
    mobilePlacement: ["more"],
  },
  {
    label: "Рекомендації",
    icon: UserRoundPlus,
    getPath: () => APP_ROUTES.FOLLOW_RECOMMENDATIONS,
    requiresAuth: true,
    mobilePlacement: ["more"],
  },
  {
    label: "Налаштування",
    icon: Settings,
    getPath: () => APP_ROUTES.SETTINGS,
    requiresAuth: true,
    mobilePlacement: ["more"],
  },
];
