import { NavLink, useParams } from "react-router";

import { PageHeader } from "@/widgets/navigation/pageHeader";
import { APP_ROUTES } from "@/shared/config/routes";
import { normalizeInlineDisplayText } from "@/shared/lib/displayText";
import { Tab } from "@/shared/ui";

import type { User } from "@/features/profiles/types";

interface FollowNavigationProps {
  user: User;
}

export default function FollowNavigation({ user }: FollowNavigationProps) {
  const { username } = useParams<{ username: string }>();
  if (!username) return null;

  const tabs = [
    {
      to: `/${username}/following`,
      label: "Підписки",
    },
    {
      to: `/${username}/followers`,
      label: "Підписники",
    },
  ];

  return (
    <PageHeader
      title={normalizeInlineDisplayText(user.displayName ?? "")}
      subtitle={`@${normalizeInlineDisplayText(user.username)}`}
      backTo={APP_ROUTES.profile(username)}
      backAriaLabel="Назад до профілю"
      footer={
        <nav className="flex" aria-label="Навігація профілю">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              replace
              className="flex flex-1 cursor-pointer justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
            >
              {({ isActive }) => <Tab active={isActive}>{tab.label}</Tab>}
            </NavLink>
          ))}
        </nav>
      }
    />
  );
}
