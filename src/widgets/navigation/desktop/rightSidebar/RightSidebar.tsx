import { useLocation } from "react-router";

import RightSidebarFooterLinks from "@/widgets/navigation/desktop/rightSidebar/RightSidebarFooterLinks";
import RightSidebarSearchBox from "@/widgets/navigation/desktop/rightSidebar/RightSidebarSearchBox";
import RightSidebarSearchFilters from "@/widgets/navigation/desktop/rightSidebar/RightSidebarSearchFilters";
import RightSidebarSuggestedUsers from "@/widgets/navigation/desktop/rightSidebar/RightSidebarSuggestedUsers";
import RightSidebarTrendsCard from "@/widgets/navigation/desktop/rightSidebar/RightSidebarTrendsCard";
import { APP_ROUTES } from "@/shared/config/routes";

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
