/** @format */

import type { ComponentType } from "react";

import { HomeIcon, ProfileIcon } from "@/shared/icons";
import { APP_ROUTES } from "@/constants/routes";
import type { User } from "@/types/user";

export interface NavigationItem {
  label: string;
  icon: ComponentType;
  getPath: (user?: User | null) => string;
  requiresAuth?: boolean;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: "Головна",
    icon: HomeIcon,
    getPath: () => APP_ROUTES.HOME,
  },
  {
    label: "Профіль",
    icon: ProfileIcon,
    getPath: (user) =>
      user ? APP_ROUTES.profile(user.username) : APP_ROUTES.HOME,
    requiresAuth: true,
  },
];
