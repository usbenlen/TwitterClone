/** @format */

import { Link } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format";

import type { Tweet } from "@/types/tweet";

interface TweetHeaderProps {
  author: Tweet["author"];
  createdAt: string;
}

export default function TweetHeader({ author, createdAt }: TweetHeaderProps) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link
        to={APP_ROUTES.profile(author.username)}
        className="truncate font-bold text-foreground hover:underline"
      >
        {author.displayName}
      </Link>

      <span className="truncate text-muted-foreground">@{author.username}</span>
      <span className="text-muted-foreground">·</span>
      <span className="shrink-0 text-muted-foreground">
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
}
