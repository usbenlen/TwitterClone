/** @format */

import { formatCount, formatJoinDate } from "@/utils/format";

import type { User } from "@/types/user";
import { useFollow } from "@/hooks/useFollow";
import { Link } from "react-router"

import { APP_ROUTES } from "@/constants/routes";

import { mockFollowing, mockFollowers } from "@/api/mock";

interface ProfileStatsProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileStats({ user, isOwnProfile }: ProfileStatsProps) {
  const {followingCount, followersCount} = useFollow();

  const countFollowing = isOwnProfile ? followingCount : mockFollowing[user.id].length;
  const countFollowers = isOwnProfile ? followersCount : mockFollowing[user.id].length;

  return (
    <div className="px-4 pb-4">
      <p className="mt-3 text-sm text-muted-foreground">
        Приєднався {formatJoinDate(user.createdAt)}
      </p>

      <div className="mt-3 flex gap-4 text-sm">

        <Link to={APP_ROUTES.following(user.username)} className="cursor-pointer hover:underline">
          <span>
            <strong className="font-bold text-foreground">
              {formatCount(countFollowing)}
            </strong>
            <span className="text-muted-foreground"> Читає</span>
          </span>
        </Link>

        <Link to={APP_ROUTES.followers(user.username)} className="cursor-pointer hover:underline">
          <span>
            <strong className="font-bold text-foreground">
              {formatCount(countFollowers)}
            </strong>
            <span className="text-muted-foreground"> Читачів</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
