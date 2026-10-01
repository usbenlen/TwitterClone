import { useAuth } from "@/hooks/useAuth";

import { MAIN_NAVIGATION, type NavigationItem } from "@/constants/navigation";
import { Shield } from "lucide-react";
import { APP_ROUTES } from "@/constants/routes";

export function useNavigation() {
  const { user } = useAuth();

  const navigation: NavigationItem[] =
    user?.role === "ADMIN"
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
