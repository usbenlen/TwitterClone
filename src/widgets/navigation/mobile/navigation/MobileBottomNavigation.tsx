import { Menu } from "lucide-react";
import { useState } from "react";

import MobileNavigationItem from "@/widgets/navigation/mobile/navigation/MobileNavigationItem";
import {
  MobileSidebar,
  MobileSidebarNavigation,
  MobileSidebarProfile,
  MobileSidebarSettings,
} from "@/widgets/navigation/mobile/sidebar";
import { useNavigation } from "@/widgets/navigation/useNavigation";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { APP_ROUTES } from "@/shared/config/routes";

export default function MobileBottomNavigation() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomItems = navigation.filter((item) =>
    item.mobilePlacement?.includes("bottom"),
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-bottom-navigation border-t border-border bg-background lg:hidden">
        <div className="flex justify-around gap-1 px-1 py-1.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <MobileNavigationItem
                key={item.label}
                label={item.label}
                to={item.to}
                icon={item.to === APP_ROUTES.NOTIFICATIONS ? <NotificationBell /> : <Icon />}
                end={item.to === APP_ROUTES.HOME}
              />
            );
          })}

          <MobileNavigationItem
            label="Відкрити меню"
            icon={<Menu size={22} />}
            onClick={() => setDrawerOpen(true)}
          />
        </div>
      </nav>

      <MobileSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MobileSidebarProfile onClose={() => setDrawerOpen(false)} />
        <MobileSidebarNavigation onNavigate={() => setDrawerOpen(false)} />
        <MobileSidebarSettings />
      </MobileSidebar>
    </>
  );
}
