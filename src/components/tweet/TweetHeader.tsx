/** @format */

import { Link } from "react-router";

import { Avatar } from "@/ui";
import { APP_ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format";
import { parseEmoji } from "@/utils/twemoji";

import type { Tweet } from "@/types/tweet";

interface TweetHeaderProps {
  author: Tweet["author"];
  createdAt: string;
  content: string;
}

export default function TweetHeader({
  author,
  createdAt,
  content,
}: TweetHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <Avatar
        name={author.displayName}
        src={author.avatarUrl}
        className="size-11 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <Link
            to={APP_ROUTES.profile(author.username)}
            className="truncate font-bold text-foreground hover:underline"
          >
            {author.displayName}
          </Link>

          <span className="truncate text-muted-foreground">
            @{author.username}
          </span>

          <span className="text-muted-foreground">·</span>

          <span className="shrink-0 text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </span>
        </div>

        <p
          className="mt-1 wrap-break-word whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: parseEmoji(content),
          }}
        />
      </div>
    </div>
  );
}
