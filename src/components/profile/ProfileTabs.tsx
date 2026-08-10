/** @format */

import { Link } from "react-router";

import { cn } from "@/utils/cn";

import type { ProfileTab } from "@/hooks/useProfile";

interface ProfileTabsProps {
  activeTab: ProfileTab;
}

const PROFILE_TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: "posts", label: "Твіти" },
  { id: "likes", label: "Лайки" },
  { id: "reposts", label: "Репости" },
];

export default function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <div className="border-b border-border px-4">
      <div className="flex items-center gap-4">
        {PROFILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              to={{
                search: tab.id === "posts" ? "" : `?tab=${tab.id}`,
              }}
              className={cn(
                "border-b-2 px-2 py-3 font-semibold transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
