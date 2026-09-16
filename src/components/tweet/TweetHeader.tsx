import { BadgeCheck } from "lucide-react";
import { Link } from "react-router";

import ActionsMenu from "@/components/tweet/ActionsMenu";

import { APP_ROUTES } from "@/constants/routes";

import { formatRelativeTime } from "@/utils/format";

import type { Tweet } from "@/types/tweet";

interface TweetHeaderProps {
  author: Tweet["author"];
  createdAt: string;
  updatedAt?: string | null;
  replyToUsername?: string | null;
  onDelete?: () => void;
  onEdit?: () => void;
  onOpenEditHistory?: () => void;
}

export default function TweetHeader({
  author,
  createdAt,
  updatedAt,
  replyToUsername,
  onDelete,
  onEdit,
  onOpenEditHistory,
}: TweetHeaderProps) {
  return (
    <div className="relative flex flex-col gap-0.5 min-w-0">
      <div className="relative flex items-start justify-between gap-2 min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1 pr-8 text-sm">
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

          {updatedAt && (
            <>
              <span className="text-muted-foreground">·</span>
              {onOpenEditHistory ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenEditHistory();
                  }}
                  className="shrink-0 cursor-pointer text-muted-foreground italic underline-offset-2 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Відкрити історію редагувань"
                >
                  Відредаговано
                </button>
              ) : (
                <span className="shrink-0 text-muted-foreground italic">
                  Відредаговано
                </span>
              )}
            </>
          )}
        </div>

        {(onDelete || onEdit) && (
          <div className="absolute right-0 top-0">
            <ActionsMenu onDelete={onDelete} onEdit={onEdit} />
          </div>
        )}
      </div>

      {replyToUsername && (
        <div className="w-full text-xs text-muted-foreground">
          У відповідь{" "}
          <Link
            to={APP_ROUTES.profile(replyToUsername)}
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline"
          >
            @{replyToUsername}
          </Link>
        </div>
      )}
    </div>
  );
}
