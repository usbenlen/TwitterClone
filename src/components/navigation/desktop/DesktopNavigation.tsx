import { APP_ROUTES } from "@/constants/routes";

import { useNavigation } from "@/hooks/useNavigation";

import DesktopNavigationItem from "@/components/navigation/desktop/DesktopNavigationItem";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface NavigationProps {
  vertical?: boolean;
}

export default function DesktopNavigation({ vertical = false }: NavigationProps) {
  const navigation = useNavigation();

  return (
    <nav
      className={vertical ? "flex flex-col gap-2" : "flex items-center gap-2"}
    >
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <DesktopNavigationItem
            key={item.label}
            to={item.to}
            icon={item.to === APP_ROUTES.NOTIFICATIONS ? <NotificationBell /> : <Icon />}
            vertical={vertical}
            end={item.to === APP_ROUTES.HOME}
          >
            {item.label}
          </DesktopNavigationItem>
        );
      })}
    </nav>
  );
}
