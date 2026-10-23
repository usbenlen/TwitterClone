import { PROFILE_TABS } from "@/constants/profile";
import { Link } from "react-router";

import type { ProfileTab } from "@/hooks/useProfile";

import { Tab } from "@/ui/index";

interface ProfileTabsProps {
  activeTab: ProfileTab;
}

export default function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <nav className="flex min-w-0 overflow-x-auto border-b border-border" aria-label="Профіль">
      {PROFILE_TABS.map((tab) => (
        <Link
          key={tab.id}
          to={{
            search: tab.id === "posts" ? "" : `?tab=${tab.id}`,
          }}
          replace
          className="flex min-w-max flex-1 justify-center px-2 pt-3 transition-colors hover:bg-muted rounded-t-sm sm:px-4 dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
        >
          <Tab active={tab.id === activeTab}>{tab.label}</Tab>
        </Link>
      ))}
    </nav>
  );
}
