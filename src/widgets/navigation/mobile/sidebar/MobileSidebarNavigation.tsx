import MobileSidebarItem from "@/widgets/navigation/mobile/sidebar/MobileSidebarItem";
import { useNavigation } from "@/widgets/navigation/useNavigation";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { APP_ROUTES } from "@/shared/config/routes";

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
