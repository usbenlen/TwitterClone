import { VerifiedBadge } from "@/ui/VerifiedBadge";

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

        <VerifiedBadge user={user} size={20} />
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
