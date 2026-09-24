import { Search } from "lucide-react";

import Select from "@/admin/components/ui/selects/Select";

import type {ReportSort} from "@/admin/hooks/moderation/useModerationFilters";

type ModerationSortProps = {
    query: string;
    sort: ReportSort;

    onQueryChange: (value: string) => void;
    onSortChange: (value: ReportSort) => void;
};

export default function ModerationSort({
   query,
   sort,
   onQueryChange,
   onSortChange,
}: ModerationSortProps) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                    value={query}
                    onChange={(event) =>
                        onQueryChange(
                            event.target.value,
                        )
                    }
                    placeholder="Пошук за текстом, ім'ям або username..."
                    className="h-10 rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
            </div>

            <Select
                value={sort}
                onChange={(value) =>
                    onSortChange(
                        value as ReportSort,
                    )
                }
                options={[
                    {
                        value: "critical",
                        label: "Спочатку критичні",
                    },
                    {
                        value: "newest",
                        label: "Спочатку нові",
                    },
                    {
                        value: "oldest",
                        label: "Спочатку старі",
                    },
                    {
                        value: "activity",
                        label: "За активністю",
                    },
                ]}
            />
        </div>
    );
}