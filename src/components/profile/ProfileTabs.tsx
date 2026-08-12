/** @format */

import { Link } from "react-router";

import { Tab } from "@/ui";
import type { ProfileTab } from "@/hooks/useProfile";

interface ProfileTabsProps {
    activeTab: ProfileTab;
}

const PROFILE_TABS: Array<{
    id: ProfileTab;
    label: string;
}> = [
    { id: "posts", label: "Твіти" },
    { id: "likes", label: "Лайки" },
    { id: "reposts", label: "Репости" },
];

export default function ProfileTabs({
                                        activeTab,
                                    }: ProfileTabsProps) {
    return (
        <nav
            className="flex border-b border-border"
            aria-label="Профіль"
        >
            {PROFILE_TABS.map((tab) => (
                <Link
                    key={tab.id}
                    to={{
                        search:
                            tab.id === "posts"
                                ? ""
                                : `?tab=${tab.id}`,
                    }}
                    className="flex flex-1 justify-center px-4 pt-3 transition-colors hover:bg-muted rounded-t-sm"
                >
                    <Tab active={tab.id === activeTab}>
                        {tab.label}
                    </Tab>
                </Link>
            ))}
        </nav>
    );
}