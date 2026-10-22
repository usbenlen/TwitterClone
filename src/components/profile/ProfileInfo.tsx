import { MapPin } from "lucide-react";

import { VerifiedBadge } from "@/ui/VerifiedBadge";

import type { User } from "@/types/user";

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex min-w-0 items-center gap-1">
        <h2 className="min-w-0 wrap-break-word text-xl font-extrabold text-foreground">
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

      {user.location && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 wrap-break-word">
            {user.location.name}
            {user.location.country && `, ${user.location.country}`}
          </span>
        </p>
      )}
    </div>
  );
}
