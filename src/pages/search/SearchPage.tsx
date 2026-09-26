import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { useSearch } from "@/hooks/useSearch";

import { Spinner, Tab } from "@/ui";

import { SearchPageSearchBox } from "@/components/search";
import { TweetCard } from "@/components/tweet";
import { UserListItem } from "@/components/user";

import { APP_ROUTES } from "@/constants/routes";

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

  const { users, posts, isLoading, error } = useSearch(query);

  const hasQuery = query.trim().length > 0;
  const activeResultsCount =
    activeType === "posts" ? posts.length : users.length;

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

          <SearchPageSearchBox
            key={query}
            query={query}
            activeType={activeType}
          />
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
            <TweetCard key={tweet.id} tweet={tweet} onReport={() => {}} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
}
