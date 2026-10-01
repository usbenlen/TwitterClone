import { Outlet } from "react-router";

import { LeftSidebar } from "@/components/layout/desktop/leftSidebar/index";
import { RightSidebar } from "@/components/layout/desktop/rightSidebar/index";
import { MobileBottomNavigation } from "@/components/layout/mobile/index";

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
