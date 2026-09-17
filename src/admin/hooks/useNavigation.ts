import { useAuth } from "@/hooks/useAuth";

import { ADMIN_NAVIGATION } from "@/admin/constants/navigation";

export function useNavigation() {
    const { user } = useAuth();

    return ADMIN_NAVIGATION.filter((item) => !item.requiresAuth || !!user).map(
        (item) => ({
            ...item,
            to: item.getPath(user),
        }),
    );
}
