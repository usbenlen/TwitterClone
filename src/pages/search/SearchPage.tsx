/** @format */

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";

import SearchPostResult from "@/components/search/SearchPostResult";
import SearchUserResult from "@/components/search/SearchUserResult";

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
  const [draftQuery, setDraftQuery] = useState(query);

  const { users, posts, isLoading, error } = useSearch(query);

  const hasQuery = query.trim().length > 0;
  const activeResultsCount =
    activeType === "posts" ? posts.length : users.length;

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(APP_ROUTES.search(draftQuery, activeType));
  };

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

        <form
          onSubmit={submitSearch}
          className="mt-4 flex items-center gap-2 rounded-full bg-muted px-4 py-2.5"
        >
          <Search size={18} className="shrink-0 text-muted-foreground" />

          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Пошук"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

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
            <SearchPostResult
              key={tweet.id}
              tweet={tweet}
              onClick={() => navigate(APP_ROUTES.post(tweet.id))}
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
