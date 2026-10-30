import { useRef } from "react";
import { Link } from "react-router";

import RightSidebarCard from "@/components/navigation/desktop/RightSidebarCard";
import { sidebarCardActionClassName } from "@/components/navigation/desktop/RightSidebarCard";
import { TrendsList } from "@/components/recommendations/TrendsList";

import { SIDEBAR } from "@/constants/layout";
import { APP_ROUTES } from "@/constants/routes";

import { useTrends, useTrendFeedback } from "@/hooks/recommendations";

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
