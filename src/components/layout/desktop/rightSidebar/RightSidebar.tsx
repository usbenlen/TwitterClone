/** @format */

import {
  RightSidebarSearchBox,
  RightSidebarSuggestedUsers,
  RightSidebarTrendsCard,
  RightSidebarFooterLinks,
} from "@/components/layout/desktop/rightSidebar";

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 px-4 py-4">
        <RightSidebarSearchBox />
        <RightSidebarTrendsCard />
        <RightSidebarSuggestedUsers />
        <RightSidebarFooterLinks />
      </div>
    </aside>
  );
}
