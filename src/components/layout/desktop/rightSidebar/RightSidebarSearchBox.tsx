/** @format */

import { useState } from "react";
import { Search, X } from "lucide-react";

import { useSearch } from "@/hooks/useSearch";

import SearchUserResult from "@/components/search/SearchUserResult";
import SearchPostResult from "@/components/search/SearchPostResult";

export default function RightSidebarSearchBox() {
  const [query, setQuery] = useState("");

  const { users, posts, isLoading, error } = useSearch(query);

  const hasQuery = query.trim().length > 0;
  const hasResults = users.length > 0 || posts.length > 0;

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5">
        <Search size={18} className="shrink-0 text-muted-foreground" />

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Пошук"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />

        {hasQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Очистити пошук"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-xl">
          {isLoading && (
            <div className="p-5 text-center text-sm text-muted-foreground">
              Пошук...
            </div>
          )}

          {!isLoading && error && (
            <div className="p-5 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasResults && (
            <div className="p-5 text-center text-sm text-muted-foreground">
              Нічого не знайдено.
            </div>
          )}

          {!isLoading && !error && hasResults && (
            <>
              {users.length > 0 && (
                <section>
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Користувачі
                  </div>

                  {users.map((user) => (
                    <SearchUserResult key={user.id} user={user} />
                  ))}
                </section>
              )}

              {posts.length > 0 && (
                <section className="border-t border-border">
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Дописи
                  </div>

                  {posts.map((tweet) => (
                    <SearchPostResult key={tweet.id} tweet={tweet} />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
