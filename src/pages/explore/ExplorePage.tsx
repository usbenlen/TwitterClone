import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { PageHeader } from "@/components/layout/pageHeader/index";
import { SearchPageSearchBox } from "@/components/search/index";
import { TrendsList } from "@/components/recommendations/TrendsList";
import {
  ExploreSection,
  ExploreAuthors,
  ExplorePosts,
} from "@/components/explore";

import { EXPLORE_LIMITS, EXPLORE_TABS } from "@/constants/explore";
import { SIDEBAR } from "@/constants/layout";
import { TRENDS_PAGE_LIMIT } from "@/constants/recommendations";
import { APP_ROUTES } from "@/constants/routes";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";

import { useTrends } from "@/hooks/useRecommendations";
import { useAppDispatch } from "@/store/hooks";
import { trendDismissed } from "@/store/trendFeedback";

import { Tab } from "@/ui";

import { filterExploreTrends, parseExploreTab } from "@/utils/explore";

import type { ExploreTab, TrendFeedbackReason } from "@/types/recommendations";

export default function ExplorePage() {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const activeTab = parseExploreTab(params.get("tab"));
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    tabsRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [activeTab]);

  const result = useTrends(TRENDS_PAGE_LIMIT);
  const news = filterExploreTrends(result.trends, "news");
  const dismissTrend = (trendId: string, reason: TrendFeedbackReason) => {
    dispatch(trendDismissed({ trendId, reason }));
  };
  const focusActiveTab = () => {
    tabsRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus();
  };
  const selectTab = (tab: ExploreTab) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous);

      if (tab === "overview") next.delete("tab");
      else next.set("tab", tab);

      return next;
    });
  };

  return (
    <section className="w-full min-w-0 max-w-3xl border-r border-border bg-background">
      <h1 className="sr-only">Дослідження</h1>
      <PageHeader
        content={
          <SearchPageSearchBox query="" criteria={DEFAULT_SEARCH_CRITERIA} />
        }
        footer={
          <nav
            ref={tabsRef}
            aria-label="Розділи огляду"
            tabIndex={0}
            className="min-w-0 overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex w-max min-w-full flex-nowrap">
              {EXPLORE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={activeTab === tab.value}
                  onClick={() => selectTab(tab.value)}
                  className="flex shrink-0 flex-1 cursor-pointer justify-center whitespace-nowrap px-5 pt-3 transition-colors hover:bg-muted focus-visible:focus-indicator dark:hover:bg-surface-hover"
                >
                  <Tab active={activeTab === tab.value}>{tab.label}</Tab>
                </button>
              ))}
            </div>
          </nav>
        }
      />

      {activeTab === "overview" ? (
        <>
          <ExploreSection
            title="Новини"
            moreTo={
              !result.error && news.length
                ? APP_ROUTES.explore("news")
                : undefined
            }
          >
            <TrendsList
              {...result}
              trends={news.slice(0, EXPLORE_LIMITS.NEWS)}
              emptyMessage="Поки що тем у цій категорії немає."
            />
          </ExploreSection>
          <ExploreSection
            title="Популярне"
            moreTo={
              !result.error && result.trends.length
                ? APP_ROUTES.explore("trending")
                : undefined
            }
          >
            <TrendsList
              {...result}
              trends={result.trends.slice(0, SIDEBAR.TRENDS_LIMIT)}
              onDismiss={dismissTrend}
              onEmptyFocus={focusActiveTab}
            />
          </ExploreSection>
          <ExploreAuthors />
          <ExplorePosts />
        </>
      ) : (
        <section
          aria-label={
            EXPLORE_TABS.find((tab) => tab.value === activeTab)?.label
          }
        >
          <TrendsList
            {...result}
            numbered={activeTab === "trending"}
            onDismiss={activeTab === "trending" ? dismissTrend : undefined}
            onEmptyFocus={focusActiveTab}
            trends={
              activeTab === "trending"
                ? result.trends
                : filterExploreTrends(result.trends, activeTab)
            }
            emptyMessage={
              activeTab === "trending"
                ? "Поки що популярних тем немає."
                : "Поки що тем у цій категорії немає."
            }
          />
        </section>
      )}
    </section>
  );
}
