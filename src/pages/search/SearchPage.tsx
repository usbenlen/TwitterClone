/** @format */

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import SearchUserResult from "@/components/search/SearchUserResult";
import { TweetCard } from "@/components/tweet";

import { useSearch } from "@/hooks/useSearch";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { Spinner } from "@/ui";

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
  const [draftQuery] = useState(query);

  const { users, posts, isLoading, error } = useSearch(query);

  const hasQuery = query.trim().length > 0;
  const activeResultsCount =
    activeType === "posts" ? posts.length : users.length;

  const switchType = (type: SearchType) => {
    navigate(APP_ROUTES.search(query || draftQuery, type));
  };

  const emptyMessage = useMemo(() => {
    if (!hasQuery) return "Введіть запит, щоб знайти пости або користувачів.";
    if (activeType === "posts") return "Пости за цим запитом не знайдені.";
    return "Користувачів за цим запитом не знайдено.";
  }, [activeType, hasQuery]);

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
        <h1 className="text-xl font-bold text-foreground">Пошук</h1>

        <div className="mt-4 grid grid-cols-2 rounded-full bg-muted p-1">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => switchType(type.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                activeType === type.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
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
