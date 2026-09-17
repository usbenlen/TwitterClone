import { useState } from "react";
import { useNavigate } from "react-router";

import { SearchBox } from "@/ui";

import { APP_ROUTES } from "@/constants/routes";

export default function RightSidebarSearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const hasQuery = query.trim().length > 0;

  const submitSearch = () => {
    if (!hasQuery) {
      navigate(APP_ROUTES.SEARCH);
      return;
    }

    navigate(APP_ROUTES.search({ query, type: "posts" }));
  };

  return (
    <SearchBox value={query} onChange={setQuery} onSubmit={submitSearch} />
  );
}
