import { useState } from "react";

export default function useUsersPagination(
    totalPagesFromApi: number,
) {
    const [currentPage, setCurrentPage] = useState(() => {
        const params = new URLSearchParams(
            window.location.search,
        );

        const page = Number(params.get("page"));

        return Number.isFinite(page) && page > 0 ? page : 1;
    });

    const totalPages = Math.max(1, totalPagesFromApi);

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
        const next = Math.min(
            currentPage + 1,
            totalPages,
        );

        goToPage(next);
    };

    const previousPage = () => {
        const previous = Math.max(
            currentPage - 1,
            1,
        );

        goToPage(previous);
    };

    const resetPage = () => {
        goToPage(1);
    };

    return {
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    };
}