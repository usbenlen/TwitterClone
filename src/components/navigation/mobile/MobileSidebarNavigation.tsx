import { useNavigation } from "@/hooks/useNavigation";

import { APP_ROUTES } from "@/constants/routes";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import MobileSidebarItem from "@/components/navigation/mobile/MobileSidebarItem";

interface MobileSidebarNavigationProps {
  onNavigate?: () => void;
}

export default function MobileDrawerNavigation({
  onNavigate,
}: MobileSidebarNavigationProps) {
  const navigation = useNavigation();
  const moreItems = navigation.filter((item) =>
    item.mobilePlacement?.includes("more"),
  );

  return (
    <nav className="space-y-1">
      {moreItems.map((item) => {
        const Icon = item.icon;

        return (
          <MobileSidebarItem
            key={item.label}
            to={item.to}
            icon={item.to === APP_ROUTES.NOTIFICATIONS ? <NotificationBell /> : <Icon />}
            onClick={onNavigate}
          >
            {item.label}
          </MobileSidebarItem>
        );
      })}
    </nav>
  );
}
