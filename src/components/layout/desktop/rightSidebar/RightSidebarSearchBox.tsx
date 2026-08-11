/** @format */

import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";

import { APP_ROUTES } from "@/constants/routes";

export default function RightSidebarSearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const hasQuery = query.trim().length > 0;

  const clearSearch = () => {
    setQuery("");
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasQuery) {
      navigate(APP_ROUTES.SEARCH);
      return;
    }

    navigate(APP_ROUTES.search(query, "posts"));
  };

  return (
    <form onSubmit={submitSearch} className="relative">
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-ring">
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
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            aria-label="Очистити пошук"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  );
}
