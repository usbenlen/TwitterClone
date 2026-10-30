import { Shield } from "lucide-react";

import { useAuth } from "@/hooks/auth/useAuth";

import { MAIN_NAVIGATION, type DesktopNavigationItem } from "@/constants/navigation";
import { APP_ROUTES } from "@/constants/routes";

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
