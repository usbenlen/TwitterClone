import { useRef } from "react";
import { Link } from "react-router";

import RightSidebarCard, { sidebarCardActionClassName } from "@/widgets/navigation/desktop/rightSidebar/RightSidebarCard";
import { TrendsList } from "@/features/discovery/components/recommendations";
import { useTrendFeedback, useTrends } from "@/features/discovery/hooks";
import { APP_ROUTES } from "@/shared/config/routes";
import { SIDEBAR } from "@/shared/constants/layout";

function TrendsListContent({
  result,
}: {
  result: ReturnType<typeof useTrends>;
}) {
  const { dismissTrend, feedbackError } = useTrendFeedback("sidebar");
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={contentRef} className="-mx-4" tabIndex={-1}>
      <TrendsList
        {...result}
        compact
        onDismiss={dismissTrend}
        feedbackError={feedbackError}
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
