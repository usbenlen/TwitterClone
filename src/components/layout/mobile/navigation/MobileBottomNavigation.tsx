/** @format */

import { useState } from "react";
import { Menu } from "lucide-react";

import { useNavigation } from "@/hooks/useNavigation";

import {
  MobileNavigationItem,
  MobileSidebar,
  MobileSidebarNavigation,
  MobileSidebarProfile,
  MobileSidebarSettings,
} from "@/components/layout/mobile";

export default function MobileBottomNavigation() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background lg:hidden">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <MobileNavigationItem
                key={item.label}
                to={item.to}
                icon={<Icon />}
                end={item.label === "Головна"}
              />
            );
          })}

          <MobileNavigationItem
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
