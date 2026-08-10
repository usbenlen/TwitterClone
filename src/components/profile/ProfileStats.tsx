/** @format */

import { Link } from "react-router";

import { formatCount, formatJoinDate } from "@/utils/format";

import { useFollow } from "@/hooks/useFollow";

import { APP_ROUTES } from "@/constants/routes";

import type { User } from "@/types/user";

interface ProfileStatsProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileStats({
  user,
  isOwnProfile,
}: ProfileStatsProps) {
  const { followingCount, followersCount } = useFollow();
  const countFollowing = isOwnProfile ? followingCount : user.followingCount;
  const countFollowers = isOwnProfile ? followersCount : user.followersCount;

  return (
    <div className="px-4">
      <p className="text-sm text-muted-foreground">
        Приєднався {formatJoinDate(user.createdAt)}
      </p>

      <div className="mt-3 flex gap-4 text-sm">
        <Link
          to={APP_ROUTES.following(user.username)}
          className="cursor-pointer hover:underline"
        >
          <strong className="font-bold text-foreground">
            {formatCount(countFollowing)}
          </strong>

          <span className="text-muted-foreground"> Підписки</span>
        </Link>

        <Link
          to={APP_ROUTES.followers(user.username)}
          className="cursor-pointer hover:underline"
        >
          <strong className="font-bold text-foreground">
            {formatCount(countFollowers)}
          </strong>

          <span className="text-muted-foreground"> Підписників</span>
        </Link>
      </div>
    </div>
  );
}
