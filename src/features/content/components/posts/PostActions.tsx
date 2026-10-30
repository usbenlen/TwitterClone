import { Bookmark, Eye, MessageCircle, Repeat2 } from "lucide-react";
import { useState } from "react";

import RepostMenu from "@/features/content/components/posts/RepostMenu";
import { cn } from "@/shared/lib/cn";
import { formatCount } from "@/shared/lib/format";
import { HeartIcon, Tooltip } from "@/shared/ui";

interface PostActionsProps {
  likedByMe: boolean;
  likesCount: number;

  repostedByMe: boolean;
  repliesCount: number;
  retweetsCount: number;

  viewsCount: number;
  bookmarkedByMe: boolean;

  onComment: () => void;
  onRepost: () => void;
  onQuote: () => void;
  repostPending?: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

export default function PostActions({
  likedByMe,
  likesCount,
  repostedByMe,
  repliesCount,
  retweetsCount,
  viewsCount,
  bookmarkedByMe,
  onComment,
  onRepost,
  onQuote,
  repostPending = false,
  onLike,
  onBookmark,
}: PostActionsProps) {
  const [repostButton, setRepostButton] = useState<HTMLButtonElement | null>(null);
  const [isRepostMenuOpen, setIsRepostMenuOpen] = useState(false);

  return (
    <div className="mt-2 flex w-full min-w-0 items-center justify-between gap-1 text-muted-foreground sm:justify-start sm:gap-5">
      <Tooltip label="Коментувати">
        <button
          type="button"
          onClick={onComment}
          aria-label="Коментувати"
          className="post-action flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-primary focus-visible:text-primary focus-visible:focus-indicator"
        >
          <span className="post-action-icon" aria-hidden="true">
            <MessageCircle size={18} />
          </span>

          {repliesCount > 0 && (
            <span className="text-sm">{formatCount(repliesCount)}</span>
          )}
        </button>
      </Tooltip>

      <Tooltip label={repostedByMe ? "Скасувати репост" : "Репостнути"}>
        <button
          ref={setRepostButton}
          type="button"
          onClick={() => setIsRepostMenuOpen((value) => !value)}
          disabled={repostPending}
          aria-label={repostedByMe ? "Скасувати репост" : "Репостнути"}
          aria-pressed={repostedByMe}
          aria-expanded={isRepostMenuOpen}
          aria-haspopup="menu"
          className={cn(
            "post-action flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-emerald-500 focus-visible:text-emerald-500",
            "focus-visible:focus-indicator dark:disabled:pointer-events-none dark:disabled:opacity-50",
            repostedByMe && "text-emerald-500",
          )}
        >
          <span className="post-action-icon" aria-hidden="true">
            <Repeat2 size={18} />
          </span>

          {retweetsCount > 0 && (
            <span className="text-sm">{formatCount(retweetsCount)}</span>
          )}
        </button>
      </Tooltip>

      <RepostMenu
        open={isRepostMenuOpen}
        reference={repostButton}
        repostedByMe={repostedByMe}
        pending={repostPending}
        onOpenChange={setIsRepostMenuOpen}
        onRepost={onRepost}
        onQuote={onQuote}
      />

      <Tooltip label={likedByMe ? "Скасувати вподобання" : "Вподобати"}>
        <button
          type="button"
          onClick={onLike}
          aria-label={likedByMe ? "Скасувати вподобання" : "Вподобати"}
          aria-pressed={likedByMe}
          className={cn(
            "post-action flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-rose-500 focus-visible:text-rose-500",
            "focus-visible:focus-indicator",
            likedByMe && "text-rose-500",
          )}
        >
          <span className="post-action-icon" aria-hidden="true">
            <HeartIcon size={18} filled={likedByMe} />
          </span>

          {likesCount > 0 && (
            <span className="text-sm">{formatCount(likesCount)}</span>
          )}
        </button>
      </Tooltip>

      <div className="flex shrink-0 items-center gap-1 sm:ml-auto">
        <Tooltip label="Перегляди">
          <div
            className="flex min-w-0 items-center justify-center gap-1 rounded-full p-0.5 cursor-default select-none sm:gap-2"
            aria-label={`${viewsCount} переглядів`}
          >
            <Eye size={18} />

            <span className="text-sm">{formatCount(viewsCount)}</span>
          </div>
        </Tooltip>

        <Tooltip
          label={bookmarkedByMe ? "Видалити із закладок" : "Додати до закладок"}
        >
          <button
            type="button"
            onClick={onBookmark}
            aria-label={
              bookmarkedByMe ? "Видалити із закладок" : "Додати до закладок"
            }
            aria-pressed={bookmarkedByMe}
            className={cn(
              "ml-auto post-action flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-primary focus-visible:text-primary",
              "focus-visible:focus-indicator",
              bookmarkedByMe && "text-primary",
            )}
          >
            <span className="post-action-icon" aria-hidden="true">
              <Bookmark
                size={18}
                fill={bookmarkedByMe ? "currentColor" : "none"}
              />
            </span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
