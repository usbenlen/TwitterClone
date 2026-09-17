import type { ComponentType } from "react";
import { LayoutDashboard, Settings, FileText, Users  } from "lucide-react";

import { APP_ROUTES } from "@/constants/routes";

import type { User } from "@/types/user";

export interface NavigationItem {
    label: string;
    icon: ComponentType;
    getPath: (user?: User | null) => string;
    requiresAuth?: boolean;
}

export const ADMIN_NAVIGATION: NavigationItem[] = [
    {
        label: "Головна",
        icon: LayoutDashboard,
        getPath: () => APP_ROUTES.ADMIN,
        requiresAuth: true,
    },
    {
        label: "Модерація",
        icon: FileText,
        getPath: () => APP_ROUTES.MODERATION,
        requiresAuth: true,
    },
    {
        label: "Користовачі",
        icon: Users,
        getPath: () => APP_ROUTES.USERS,
        requiresAuth: true,
    },
    {
        label: "Налаштування",
        icon: Settings,
        getPath: () => APP_ROUTES.ADMIN_SETTINGS,
        requiresAuth: true,
    },
];
