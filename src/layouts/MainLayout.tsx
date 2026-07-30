/** @format */

import { Outlet } from "react-router";

import { LeftSidebar } from "@/components/layout/desktop/leftSidebar";
import { RightSidebar } from "@/components/layout/desktop/rightSidebar";
import {
  MobileBottomNavigation,
  MobileHeader,
} from "@/components/layout/mobile";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <div className="mx-auto w-full max-w-340 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <LeftSidebar />

        <main className="min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  );
}
