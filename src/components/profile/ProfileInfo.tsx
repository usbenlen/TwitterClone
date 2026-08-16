import { BadgeCheck } from "lucide-react";

import type { User } from "@/types/user";

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-1">
        <h2 className="text-xl font-extrabold text-foreground">
          {user.displayName}
        </h2>

        {user.isVerified && (
          <BadgeCheck
            size={20}
            className="shrink-0 text-background"
            fill="#1d9bf0"
          />
        )}
      </div>

      <p className="text-muted-foreground">@{user.username}</p>

      {user.bio && (
        <p className="mt-3 whitespace-pre-wrap wrap-break-word text-foreground">
          {user.bio}
        </p>
      )}
    </div>
  );
}
