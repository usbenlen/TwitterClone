import { useLocation } from "react-router";

import {
  RightSidebarSearchBox,
  RightSidebarSuggestedUsers,
  RightSidebarTrendsCard,
  RightSidebarFooterLinks,
  RightSidebarSearchFilters,
} from "@/components/navigation/desktop";

import { APP_ROUTES } from "@/constants/routes";

export default function RightSidebar() {
  const location = useLocation();
  const isSearchPage = location.pathname === APP_ROUTES.SEARCH;
  const isExplorePage = location.pathname === APP_ROUTES.EXPLORE;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4 flex flex-col gap-4 px-4 py-4">
        {isSearchPage ? (
          <RightSidebarSearchFilters />
        ) : !isExplorePage ? (
          <RightSidebarSearchBox />
        ) : null}

        <RightSidebarTrendsCard />
        <RightSidebarSuggestedUsers />
        <RightSidebarFooterLinks />
      </div>
    </aside>
  );
}
