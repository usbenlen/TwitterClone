/** @format */

import type { ComponentType } from "react";

import { Settings, UserRound, House } from "lucide-react";
import { APP_ROUTES } from "@/constants/routes";
import type { User } from "@/types/user";

export interface NavigationItem {
  label: string;
  icon: ComponentType;
  getPath: (user?: User | null) => string;
  requiresAuth?: boolean;
  mobilePlacement?: Array<"bottom" | "more">;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: "Головна",
    icon: House,
    getPath: () => APP_ROUTES.HOME,
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
    label: "Налаштування",
    icon: Settings,
    getPath: () => APP_ROUTES.SETTINGS,
    requiresAuth: true,
    mobilePlacement: ["more"],
  },
];
