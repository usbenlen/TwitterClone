import type { ReportFiltersState } from "@/admin/types/moderation";
import Input from "@/admin/components/ui/Input.tsx";
import Select from "@/admin/components/ui/selects/Select.tsx";

type ModerationFiltersProps = {
    type: ReportFiltersState["type"];
    search: string;
    moderationStatus: ReportFiltersState["status"];
    decision: ReportFiltersState["decision"];
    sort: ReportFiltersState["sort"];
    source: ReportFiltersState["source"];

    onTypeChange: (
        value: ReportFiltersState["type"],
    ) => void;

    onSearchChange: (value: string) => void;
    onStatusChange: (value: ReportFiltersState["status"]) => void;
    onDecisionChange: (value: ReportFiltersState["decision"]) => void;
    onSortChange: (value: ReportFiltersState["sort"]) => void;
    onSourceChange: (value: ReportFiltersState["source"]) => void;
};

export default function ModerationFilters({
  type,
  search,
  moderationStatus,
  // decision,
  sort,
  source,
  onTypeChange,
  onSearchChange,
  onStatusChange,
  // onDecisionChange,
  onSortChange,
  onSourceChange,
}: ModerationFiltersProps) {
    return (
        <div className="flex flex-row gap-2 pt-4">
            <Select
                value={type}
                onChange={(value) =>
                    onTypeChange(
                        value as ReportFiltersState["type"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Типи",
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
                        value as ReportFiltersState["source"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Джерела",
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
                        value as ReportFiltersState["status"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Статуси",
                    },
                    {
                        value: "pending",
                        label: "На перевірці",
                    },
                    {
                        value: "resolved",
                        label: "Завершено",
                    },
                ]}
            />

            {/*<Select*/}
            {/*    value={decision}*/}
            {/*    onChange={(value) =>*/}
            {/*        onDecisionChange(*/}
            {/*            value as ReportFiltersState["decision"],*/}
            {/*        )*/}
            {/*    }*/}
            {/*    options={[*/}
            {/*        {*/}
            {/*            value: "all",*/}
            {/*            label: "Рішення",*/}
            {/*        },*/}
            {/*        {*/}
            {/*            value: "keep",*/}
            {/*            label: "Залишено",*/}
            {/*        },*/}
            {/*        {*/}
            {/*            value: "delete",*/}
            {/*            label: "Видалено",*/}
            {/*        },*/}
            {/*        {*/}
            {/*            value: "block",*/}
            {/*            label: "Заблоковано",*/}
            {/*        },*/}
            {/*    ]}*/}
            {/*/>*/}

            <Select
                value={sort}
                onChange={(value) =>
                    onSortChange(
                        value as ReportFiltersState["sort"],
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
                ]}
            />
        </div>
    );
}