/** @format */

import { useLocation } from "react-router";

import {
  RightSidebarSearchBox,
  RightSidebarSuggestedUsers,
  RightSidebarTrendsCard,
  RightSidebarFooterLinks,
  RightSidebarSearchFilters
} from "@/components/layout/desktop/rightSidebar";

import { APP_ROUTES } from "@/constants/routes";

export default function RightSidebar() {
  const location = useLocation();
  const isSearchPage = location.pathname === APP_ROUTES.SEARCH;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 px-4 py-4">
        {isSearchPage ? (
            <RightSidebarSearchFilters />
        ) : (
            <RightSidebarSearchBox />
        )}

        <RightSidebarTrendsCard />
        <RightSidebarSuggestedUsers />
        <RightSidebarFooterLinks />
      </div>
    </aside>
  );
}
