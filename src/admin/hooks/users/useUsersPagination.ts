import { useMemo, useState } from "react";

import { USERS_ITEMS_PER_PAGE } from "@/admin/constants/users.ts";

export default function useUsersPagination<T>(items: T[]) {
    const [currentPage, setCurrentPage] = useState(() => {
        const params = new URLSearchParams(
            window.location.search,
        );

        const page = Number(params.get("page"));

        return Number.isFinite(page) && page > 0 ? page : 1;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(
            items.length / USERS_ITEMS_PER_PAGE,
        ),
    );

    const paginatedItems = useMemo(() => {
        const start =
            (currentPage - 1) * USERS_ITEMS_PER_PAGE;

        return items.slice(
            start,
            start + USERS_ITEMS_PER_PAGE,
        );
    }, [items, currentPage]);

    const goToPage = (page: number) => {
        const nextPage = Math.min(
            Math.max(page, 1),
            totalPages,
        );

        setCurrentPage(nextPage);

        const params = new URLSearchParams(
            window.location.search,
        );

        params.set("page", String(nextPage));

        window.history.pushState(
            null,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    };

    const nextPage = () => {
        setCurrentPage((previousPage) => {
            const next = Math.min(
                previousPage + 1,
                totalPages,
            );

            const params = new URLSearchParams(
                window.location.search,
            );

            params.set("page", String(next));

            window.history.pushState(
                null,
                "",
                `${window.location.pathname}?${params.toString()}`,
            );

            return next;
        });
    };

    const previousPage = () => {
        setCurrentPage((previousPage) => {
            const next = Math.max(
                previousPage - 1,
                1,
            );

            const params = new URLSearchParams(
                window.location.search,
            );

            params.set("page", String(next));

            window.history.pushState(
                null,
                "",
                `${window.location.pathname}?${params.toString()}`,
            );

            return next;
        });
    };

    const resetPage = () => {
        setCurrentPage(1);

        const params = new URLSearchParams(
            window.location.search,
        );

        params.set("page", "1");

        window.history.pushState(
            null,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
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