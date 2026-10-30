import { Shield } from "lucide-react";

import { MAIN_NAVIGATION } from "@/widgets/navigation/constants/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { APP_ROUTES } from "@/shared/config/routes";

import type { DesktopNavigationItem } from "@/widgets/navigation/constants/navigation";

export function useNavigation() {
  const { user } = useAuth();

  const navigation: DesktopNavigationItem[] =
    user?.role === "Admin"
      ? [
          ...MAIN_NAVIGATION,
          {
            label: "Адмін-панель",
            icon: Shield,
            getPath: () => APP_ROUTES.ADMIN,
            requiresAuth: true,
            mobilePlacement: ["more"],
          },
        ]
      : MAIN_NAVIGATION;

  return navigation
    .filter((item) => !item.requiresAuth || !!user)
    .map((item) => ({
      ...item,
      to: item.getPath(user),
    }));
}
