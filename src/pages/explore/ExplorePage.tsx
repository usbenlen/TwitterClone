import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import { ExplorePosts } from "@/widgets/discovery";
import { PageHeader } from "@/widgets/navigation/pageHeader";
import {
  ExploreAuthors,
  ExploreSection,
  TrendsList,
} from "@/features/discovery/components/recommendations";
import { SearchPageSearchBox } from "@/features/discovery/components/search";
import {
  EXPLORE_LIMITS,
  EXPLORE_TABS,
} from "@/features/discovery/constants/explore";
import { TRENDS_PAGE_LIMIT } from "@/features/discovery/constants/recommendation";
import { DEFAULT_SEARCH_CRITERIA } from "@/features/discovery/constants/search";
import {
  useExploreTrends,
  useTrendFeedback,
  useTrends,
} from "@/features/discovery/hooks";
import { parseExploreTab } from "@/features/discovery/lib/explore";
import { APP_ROUTES } from "@/shared/config/routes";
import { SIDEBAR } from "@/shared/constants/layout";
import { Tab } from "@/shared/ui";

import type { ExploreTab } from "@/features/discovery/types";

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const activeTab = parseExploreTab(params.get("tab"));
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    tabsRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [activeTab]);

  const isPopular = activeTab === "overview" || activeTab === "trending";
  const popular = useTrends(TRENDS_PAGE_LIMIT, !isPopular);
  const category = useExploreTrends(
    isPopular ? "news" : activeTab,
    activeTab === "overview" ? EXPLORE_LIMITS.NEWS : TRENDS_PAGE_LIMIT,
    activeTab === "trending",
  );
  const result = isPopular ? popular : category;
  const { dismissTrend, feedbackError } = useTrendFeedback("explore");
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
              !category.error && category.trends.length
                ? APP_ROUTES.explore("news")
                : undefined
            }
          >
            <TrendsList
              {...category}
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
              feedbackError={feedbackError}
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
            feedbackError={activeTab === "trending" ? feedbackError : undefined}
            onEmptyFocus={focusActiveTab}
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
