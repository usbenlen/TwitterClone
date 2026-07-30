/** @format */

import { MAIN_NAVIGATION } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MobileSidebarItem } from "@/components/layout/mobile";

interface MobileSidebarNavigationProps {
  onNavigate?: () => void;
}

export default function MobileDrawerNavigation({
  onNavigate,
}: MobileSidebarNavigationProps) {
  const { user } = useAuth();

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {MAIN_NAVIGATION.map((item) => {
        if (item.requiresAuth && !user) return null;

        const Icon = item.icon;

        return (
          <MobileSidebarItem
            key={item.label}
            to={item.getPath(user)}
            icon={<Icon />}
            onClick={onNavigate}
          >
            {item.label}
          </MobileSidebarItem>
        );
      })}
    </nav>
  );
}
