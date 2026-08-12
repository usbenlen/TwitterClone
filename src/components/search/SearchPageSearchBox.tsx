/** @format */

import { useState } from "react";
import { useNavigate } from "react-router";

import { SearchBox } from "@/ui";
import { APP_ROUTES } from "@/constants/routes.ts";

type SearchType = "posts" | "users";

interface SearchPageSearchBoxProps {
    query: string;
    activeType: SearchType;
}

export default function SearchPageSearchBox({ query, activeType }: SearchPageSearchBoxProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(query);

    const submitSearch = () => {
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            navigate(APP_ROUTES.SEARCH);
            return;
        }

        navigate(APP_ROUTES.search(trimmedQuery, activeType));
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