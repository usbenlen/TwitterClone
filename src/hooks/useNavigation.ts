/** @format */

import { useAuth } from "@/hooks/useAuth";
import { MAIN_NAVIGATION } from "@/constants/navigation";

export function useNavigation() {
  const { user } = useAuth();

  return MAIN_NAVIGATION.filter((item) => !item.requiresAuth || user).map(
    (item) => ({
      ...item,
      to: item.getPath(user),
    }),
  );
}
