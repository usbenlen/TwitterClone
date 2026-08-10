/** @format */

import { CheckCircle } from "lucide-react";

import { Avatar } from "@/ui";

import type { UserShort } from "@/types";

interface SearchUserResultProps {
  user: UserShort;
  onClick?: () => void;
}

export default function SearchUserResult({
  user,
  onClick,
}: SearchUserResultProps) {
  const displayName = user.displayName?.trim() || user.username;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <Avatar
        name={displayName}
        src={user.avatarUrl ?? undefined}
        className="size-10"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate font-semibold">{displayName}</span>

          {user.isVerified && (
            <CheckCircle
              size={15}
              className="shrink-0 text-primary"
              fill="currentColor"
            />
          )}
        </div>

        <p className="truncate text-sm text-muted-foreground">
          @{user.username}
        </p>

        {user.location && (
          <p className="truncate text-xs text-muted-foreground">
            {user.location.name}, {user.location.country}
          </p>
        )}
      </div>
    </button>
  );
}
