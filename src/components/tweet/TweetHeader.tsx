/** @format */

import { BadgeCheck } from "lucide-react";
import { Link } from "react-router";

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
        <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1 text-sm">
                <Link
                    to={APP_ROUTES.profile(author.username)}
                    className="truncate font-bold text-foreground hover:underline"
                >
                    {author.displayName}
                </Link>

                {author.isVerified && (
                    <BadgeCheck
                        size={18}
                        className="shrink-0 text-background"
                        fill="#1d9bf0"
                    />
                )}

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
    );
}