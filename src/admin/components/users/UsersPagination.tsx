import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type UsersPaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function UsersPagination({
    currentPage,
    totalPages,
    onPageChange,
}: UsersPaginationProps) {
    if (totalPages <= 0) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        onPageChange(page);

        window.scrollTo({
            top: 0,
            // behavior: "smooth",
        });
    };

    return (
        <div className="flex items-center justify-between border-t border-border bg-muted/10 px-4 py-4">
            <p className="text-sm text-muted-foreground">
                Сторінка{" "}
                <span className="font-medium text-foreground">
                    {currentPage}
                </span>{" "}
                з{" "}
                <span className="font-medium text-foreground">
                    {totalPages}
                </span>
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Попередня сторінка"
                    className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" />
                </button>

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Наступна сторінка"
                    className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}