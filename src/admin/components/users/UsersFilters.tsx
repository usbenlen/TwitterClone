import Input from "@/admin/components/ui/Input.tsx";
import Select from "@/admin/components/ui/selects/Select.tsx";

import type {UsersFiltersState} from "@/admin/types/users.ts";

type UsersFiltersProps = {
    search: string;
    status: UsersFiltersState["status"];
    sort: UsersFiltersState["sort"];

    onSearchChange: (value: string) => void;

    onStatusChange: (
        value: UsersFiltersState["status"],
    ) => void;

    onSortChange: (
        value: UsersFiltersState["sort"],
    ) => void;
};

export default function UsersFilters({
    search,
    status,
    sort,
    onSearchChange,
    onStatusChange,
    onSortChange,
}: UsersFiltersProps) {
    return (
        <div className="flex flex-row gap-2 pt-4">
            <Input
                value={search}
                onChange={onSearchChange}
                placeholder="Пошук..."
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />

            <Select
                value={status}
                onChange={(value) =>
                    onStatusChange(
                        value as UsersFiltersState["status"],
                    )
                }
                options={[
                    {
                        value: "all",
                        label: "Статуси",
                    },
                    {
                        value: "active",
                        label: "Активні",
                    },
                    {
                        value: "blocked",
                        label: "Заблоковані",
                    },
                ]}
            />

            <Select
                value={sort}
                onChange={(value) =>
                    onSortChange(
                        value as UsersFiltersState["sort"],
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
