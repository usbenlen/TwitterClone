import { BadgeCheck, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { PageHeader } from "@/components/layout/pageHeader";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/ui";
import { formatPostCount } from "@/utils/format";

import type { User } from "@/types";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const displayName = user.displayName?.trim() || `@${user.username}`;

  const searchUserPosts = () => {
    navigate(
      APP_ROUTES.search({
        type: "posts",
        from: user.username,
      }),
    );
  };

  return (
    <PageHeader
      title={
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate">{displayName}</span>
          {user.isVerified && (
            <BadgeCheck
              size={19}
              className="shrink-0 text-background"
              fill="#1d9bf0"
              role="img"
              aria-label="Верифікований профіль"
            />
          )}
        </span>
      }
      subtitle={formatPostCount(user.postsCount)}
      backTo={APP_ROUTES.HOME}
      actions={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={searchUserPosts}
          aria-label={`Шукати дописи @${user.username}`}
          className="shrink-0 cursor-pointer"
        >
          <Search className="size-5" aria-hidden="true" />
        </Button>
      }
    />
  );
}
