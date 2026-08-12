/** @format */

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import SearchUserResult from "@/components/search/SearchUserResult";
import { TweetCard } from "@/components/tweet";

import { useSearch } from "@/hooks/useSearch";
import { APP_ROUTES } from "@/constants/routes";
import { SearchBox, Spinner, Tab } from "@/ui";

type SearchType = "posts" | "users";

const SEARCH_TYPES: Array<{ value: SearchType; label: string }> = [
  { value: "posts", label: "Пости" },
  { value: "users", label: "Користувачі" },
];

function normalizeSearchType(value: string | null): SearchType {
  return value === "users" ? "users" : "posts";
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const activeType = normalizeSearchType(searchParams.get("type"));

  const [searchQuery, setSearchQuery] = useState(query);

  const { users, posts, isLoading, error } = useSearch(query);

  const hasQuery = query.trim().length > 0;
  const activeResultsCount =
      activeType === "posts" ? posts.length : users.length;

  const submitSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate(APP_ROUTES.SEARCH);
      return;
    }

    navigate(APP_ROUTES.search(trimmedQuery, activeType));
  };

  const switchType = (type: SearchType) => {
    navigate(APP_ROUTES.search(query, type));
  };

  const emptyMessage = !hasQuery
      ? "Введіть запит, щоб знайти пости або користувачів."
      : activeType === "posts"
          ? "Пости за цим запитом не знайдені."
          : "Користувачів за цим запитом не знайдено.";

  return (
      <section className="w-full max-w-3xl border-r border-border bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 pt-4 backdrop-blur">
          <div className="flex items-center gap-2 px-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Назад"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-5" />
            </button>

            <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={submitSearch}
                className="min-w-0 flex-1"
            />
          </div>

          <nav
              className="mt-4 flex"
              aria-label="Тип пошуку"
          >
            {SEARCH_TYPES.map((type) => (
                <button
                    key={type.value}
                    type="button"
                    onClick={() => switchType(type.value)}
                    className="flex flex-1 cursor-pointer justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted"
                >
                  <Tab active={activeType === type.value}>
                    {type.label}
                  </Tab>
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
                  <TweetCard
                      key={tweet.id}
                      tweet={tweet}
                  />
              ))}
            </div>
        ) : (
            <div className="divide-y divide-border">
              {users.map((user) => (
                  <SearchUserResult
                      key={user.id}
                      user={user}
                      onClick={() => navigate(APP_ROUTES.profile(user.username))}
                  />
              ))}
            </div>
        )}
      </section>
  );
}