import { useMemo, useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { useSearch } from "@/hooks/useSearch";

import { Spinner, Tab } from "@/ui";

import { AdvancedSearchModal, SearchPageSearchBox } from "@/components/search";
import { TweetCard } from "@/components/tweet";
import { UserListItem } from "@/components/user";

import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks";
import {
  criteriaForType,
  hasActiveSearchCriteria,
  hasNonDefaultFilters,
  parseSearchCriteria,
} from "@/utils/search";

import type { SearchCriteria, SearchType } from "@/types";

const SEARCH_TYPES: Array<{ value: SearchType; label: string }> = [
  { value: "posts", label: "Пости" },
  { value: "users", label: "Користувачі" },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const criteria = useMemo(
    () => parseSearchCriteria(searchParams),
    [searchParams],
  );
  const query = criteria.query;
  const activeType = criteria.type;

  const { users, posts, isLoading, error } = useSearch(criteria);

  const hasCriteria = hasActiveSearchCriteria(criteria);
  const activeResultsCount = activeType === "posts" ? posts.length : users.length;

  const switchType = (type: SearchType) => {
    navigate(APP_ROUTES.search(criteriaForType(criteria, type)));
  };

  const emptyMessage = !hasCriteria
    ? "Введіть запит, щоб знайти пости або користувачів."
    : activeType === "posts"
      ? "Пости за цим запитом не знайдені."
      : "Користувачів за цим запитом не знайдено.";

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <header className="sticky top-0 z-header border-b border-border bg-background/80 pt-4 backdrop-blur">
        <div className="flex items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </button>

          <SearchPageSearchBox key={query} query={query} criteria={criteria} />

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Search filters"
            className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <SlidersHorizontal className="size-5" />
            {hasNonDefaultFilters(criteria) && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <nav className="mt-4 flex" aria-label="Тип пошуку">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => switchType(type.value)}
              className="flex flex-1 cursor-pointer justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted"
            >
              <Tab active={activeType === type.value}>{type.label}</Tab>
            </button>
          ))}
        </nav>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="px-4 py-10 text-center text-sm text-destructive">
          {error}
        </p>
      ) : activeResultsCount === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : activeType === "posts" ? (
        <div className="divide-y divide-border">
          {posts.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}

      {filtersOpen && (
        <AdvancedSearchModal
          criteria={criteria}
          viewerHasLocation={Boolean(user?.location)}
          onApply={(next: SearchCriteria) => {
            navigate(APP_ROUTES.search(next));
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </section>
  );
}
