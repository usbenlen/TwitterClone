import type { ModerationFiltersState } from "./types";
import Input from "@/admin/components/ui/Input.tsx";
import Select from "@/admin/components/ui/selects/Select.tsx";

type ModerationFiltersProps = {
    type: ModerationFiltersState["type"];
    search: string;
    moderationStatus: ModerationFiltersState["status"];
    sort: ModerationFiltersState["sort"];
    source: ModerationFiltersState["source"];

    onTypeChange: (
        value: ModerationFiltersState["type"],
    ) => void;

    onSearchChange: (value: string) => void;

    onStatusChange: (
        value: ModerationFiltersState["status"],
    ) => void;

    onSortChange: (
        value: ModerationFiltersState["sort"],
    ) => void;

    onSourceChange: (
        value: ModerationFiltersState["source"],
    ) => void;
};

export default function ModerationFilters({
  type,
  search,
  moderationStatus,
  sort,
  source,
  onTypeChange,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onSourceChange,
}: ModerationFiltersProps) {
    return (
        <div className="flex flex-row gap-2 pt-4">
            <Select
                value={type}
                onChange={(value) =>
                    onTypeChange(
                        value as ModerationFiltersState["type"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Усі типи",
                    },
                    {
                        value: "posts",
                        label: "Публікації",
                    },
                    {
                        value: "users",
                        label: "Користувачі",
                    },
                    {
                        value: "comments",
                        label: "Коментарі",
                    },
                ]}
            />

            <Input
                value={search}
                onChange={onSearchChange}
                placeholder="Пошук..."
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />

            <Select
                value={source}
                onChange={(value) =>
                    onSourceChange(
                        value as ModerationFiltersState["source"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Усі джерела",
                    },
                    {
                        value: "user",
                        label: "Сигнали користувачів",
                    },
                    {
                        value: "system",
                        label: "Системні сигнали",
                    },
                ]}
            />

            <Select
                value={moderationStatus}
                onChange={(value) =>
                    onStatusChange(
                        value as ModerationFiltersState["status"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Усі статуси",
                    },
                    {
                        value: "pending",
                        label: "На перевірці",
                    },
                    {
                        value: "approved",
                        label: "Схвалено",
                    },
                    {
                        value: "blocked",
                        label: "Заблоковано",
                    },
                    {
                        value: "deleted",
                        label: "Видалено",
                    },
                ]}
            />

            <Select
                value={sort}
                onChange={(value) =>
                    onSortChange(
                        value as ModerationFiltersState["sort"],
                    )
                }
                options={[
                    {
                        value: "newest",
                        label: "Спочатку нові",
                    },
                    {
                        value: "oldest",
                        label: "Спочатку старі",
                    },
                    {
                        value: "signals",
                        label: "За кількістю сигналів",
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

