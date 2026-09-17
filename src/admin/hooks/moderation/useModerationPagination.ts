import { useMemo, useState } from "react";

import { MODERATION_ITEMS_PER_PAGE } from "@/admin/constants/moderation.ts";

export function useModerationPagination<T>(
    items: T[],
) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(
        1,
        Math.ceil(
            items.length / MODERATION_ITEMS_PER_PAGE,
        ),
    );

    const paginatedItems = useMemo(() => {
        const start =
            (currentPage - 1) *
            MODERATION_ITEMS_PER_PAGE;

        return items.slice(
            start,
            start + MODERATION_ITEMS_PER_PAGE,
        );
    }, [items, currentPage]);

    const goToPage = (page: number) => {
        const nextPage = Math.min(
            Math.max(page, 1),
            totalPages,
        );

        setCurrentPage(nextPage);
    };

    const nextPage = () => {
        setCurrentPage((previousPage) =>
            Math.min(
                previousPage + 1,
                totalPages,
            ),
        );
    };

    const previousPage = () => {
        setCurrentPage((previousPage) =>
            Math.max(previousPage - 1, 1),
        );
    };

    const resetPage = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        totalPages,
        paginatedItems,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    };
}