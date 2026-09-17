import {
    Bot,
    Flame,
    Users,
} from "lucide-react";

import type { ModerationTab } from "./types";

type ModerationTabsProps = {
    activeTab: ModerationTab;

    counts: {
        all: number;
        system: number;
        users: number;
        critical: number;
    };

    onChange: (tab: ModerationTab) => void;
};

export default function ModerationTabs({
   activeTab,
   counts,
   onChange,
}: ModerationTabsProps) {
    const tabs = [
        {
            value: "all" as const,
            label: "Усі",
            count: counts.all,
            icon: null,
        },
        {
            value: "system" as const,
            label: "Система",
            count: counts.system,
            icon: Bot,
        },
        {
            value: "users" as const,
            label: "Люди",
            count: counts.users,
            icon: Users,
        },
        {
            value: "critical" as const,
            label: "Критичні",
            count: counts.critical,
            icon: Flame,
        },
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                    activeTab === tab.value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() =>
                            onChange(tab.value)
                        }
                        className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                            isActive
                                ? tab.value === "critical"
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-primary text-primary-foreground"
                                : "border border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        {Icon && (
                            <Icon className="size-4" />
                        )}

                        {tab.label}

                        <span className="text-xs opacity">
                            {tab.count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}