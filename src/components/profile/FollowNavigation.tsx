import { NavLink, useParams } from "react-router";

import { PageHeader } from "@/components/layout/pageHeader";
import Tab from "@/ui/Tab";

import { APP_ROUTES } from "@/constants/routes";

import type { User } from "@/types/user";

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
      title={user.displayName}
      subtitle={`@${user.username}`}
      backTo={APP_ROUTES.profile(username)}
      backAriaLabel="Назад до профілю"
      footer={
        <nav className="flex" aria-label="Навігація профілю">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              replace
              className="flex flex-1 cursor-pointer justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted"
            >
              {({ isActive }) => <Tab active={isActive}>{tab.label}</Tab>}
            </NavLink>
          ))}
        </nav>
      }
    />
  );
}
