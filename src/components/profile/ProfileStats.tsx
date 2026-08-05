/** @format */

import { formatCount, formatJoinDate } from "@/utils/format";

import type { User } from "@/types/user";
import { useFollow } from "@/hooks/useFollow";

interface ProfileStatsProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileStats({ user, isOwnProfile }: ProfileStatsProps) {
  const {followingCount} = useFollow();

  const count = isOwnProfile ? followingCount : user.followingCount;

  return (
    <div className="px-4 pb-4">
      <p className="mt-3 text-sm text-muted-foreground">
        Приєднався {formatJoinDate(user.createdAt)}
      </p>

      <div className="mt-3 flex gap-4 text-sm">
        <span>
          <strong className="font-bold text-foreground">
            {formatCount(count)}
          </strong>
          <span className="text-muted-foreground"> Читає</span>
        </span>

        <span>
          <strong className="font-bold text-foreground">
            {formatCount(user.followersCount)}
          </strong>
          <span className="text-muted-foreground"> Читачів</span>
        </span>
      </div>
    </div>
  );
}
