import { Outlet } from "react-router";

import { LeftSidebar, RightSidebar } from "@/components/navigation/desktop";
import MobileBottomNavigation from "@/components/navigation/mobile/MobileBottomNavigation";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-340 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <LeftSidebar />

        <main className="min-w-0 pb-[50vh] lg:pb-[50vh]">
          <Outlet />
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  );
}
