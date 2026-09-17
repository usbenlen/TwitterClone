import { useState } from "react";
import { useNavigate } from "react-router";

import { SearchBox } from "@/ui";

import { APP_ROUTES } from "@/constants/routes.ts";

import type { SearchCriteria } from "@/types";

interface SearchPageSearchBoxProps {
  query: string;
  criteria: SearchCriteria;
}

export default function SearchPageSearchBox({
  query,
  criteria,
}: SearchPageSearchBoxProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(query);

  const submitSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate(APP_ROUTES.search({ ...criteria, query: "" }));
      return;
    }

    navigate(APP_ROUTES.search({ ...criteria, query: trimmedQuery }));
  };

  return (
    <SearchBox
      value={searchQuery}
      onChange={setSearchQuery}
      onSubmit={submitSearch}
      className="min-w-0 flex-1"
    />
  );
}
