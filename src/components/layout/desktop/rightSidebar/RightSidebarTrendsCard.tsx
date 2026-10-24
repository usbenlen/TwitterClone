import { useRef } from "react";
import { Link } from "react-router";

import RightSidebarCard, {
  sidebarCardActionClassName,
} from "@/components/layout/desktop/rightSidebar/RightSidebarCard";
import { TrendsList } from "@/components/recommendations/TrendsList";

import { SIDEBAR, APP_ROUTES } from "@/constants";

import { useTrends } from "@/hooks";

import { useAppDispatch } from "@/store/hooks";
import { trendDismissed } from "@/store/trendFeedback";

function TrendsListContent({
  result,
}: {
  result: ReturnType<typeof useTrends>;
}) {
  const dispatch = useAppDispatch();
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={contentRef} className="-mx-4" tabIndex={-1}>
      <TrendsList
        {...result}
        compact
        onDismiss={(trendId, reason) =>
          dispatch(trendDismissed({ trendId, reason }))
        }
        onEmptyFocus={() => contentRef.current?.focus()}
      />
    </div>
  );
}

export default function RightSidebarTrendsCard() {
  const result = useTrends(SIDEBAR.TRENDS_LIMIT);
  const showMore =
    !result.isLoading && !result.error && result.trends.length > 0;

  return (
    <RightSidebarCard
      title="Популярне"
      footer={
        showMore ? (
          <Link
            to={APP_ROUTES.explore("trending")}
            className={sidebarCardActionClassName}
          >
            Показати більше
          </Link>
        ) : undefined
      }
    >
      <TrendsListContent result={result} />
    </RightSidebarCard>
  );
}
