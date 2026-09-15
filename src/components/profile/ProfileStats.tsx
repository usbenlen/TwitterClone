import { Link } from "react-router";
import { Balloon, CalendarDays } from "lucide-react";

import {
  formatBirthMonthDay,
  formatCount,
  formatJoinDate,
  getBirthYear,
} from "@/utils/format";

import { useFollow } from "@/hooks/useFollow";

import { APP_ROUTES } from "@/constants/routes";

import type { BirthDateVisibility, User } from "@/types/user";

interface ProfileStatsProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileStats({
  user,
  isOwnProfile,
}: ProfileStatsProps) {
  const { followingCount, followersCount, followers, isFollowing } =
    useFollow();
  const countFollowing = isOwnProfile ? followingCount : user.followingCount;
  const countFollowers = isOwnProfile ? followersCount : user.followersCount;
  const viewerFollowsProfile = isFollowing(user.id);
  const profileFollowsViewer = followers.some((item) => item.id === user.id);

  const canView = (visibility?: BirthDateVisibility | null) => {
    if (isOwnProfile) return true;

    switch (visibility ?? "only_me") {
      case "public":
        return true;
      case "followers":
        return viewerFollowsProfile;
      case "following":
        return profileFollowsViewer;
      case "mutual":
        return viewerFollowsProfile && profileFollowsViewer;
      case "only_me":
      default:
        return false;
    }
  };

  const birthMonthDay = user.birthDate
    ? formatBirthMonthDay(user.birthDate)
    : null;
  const birthYear = user.birthDate ? getBirthYear(user.birthDate) : null;
  const showBirthMonthDay =
    Boolean(birthMonthDay) && canView(user.birthDateVisibility);
  const showBirthYear =
    Boolean(birthYear) && canView(user.birthYearVisibility);

  const birthDateLabel = showBirthMonthDay
    ? `${birthMonthDay}${showBirthYear ? ` ${birthYear} р.` : ""}`
    : showBirthYear
      ? `Рік народження: ${birthYear}`
      : null;

  return (
    <div className="px-4 pb-3 pt-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {birthDateLabel && (
          <span className="inline-flex items-center gap-1.5">
            <Balloon className="size-4 shrink-0" aria-hidden="true" />
            {birthDateLabel}
          </span>
        )}

        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          Приєднався {formatJoinDate(user.createdAt)}
        </span>
      </div>

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
