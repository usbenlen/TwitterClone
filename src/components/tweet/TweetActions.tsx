import { Bookmark, Eye, MessageCircle, Repeat2 } from "lucide-react";

import { HeartIcon } from "@/shared/icons";

import { cn } from "@/utils/cn";
import { formatCount } from "@/utils/format";

interface TweetActionsProps {
  likedByMe: boolean;
  likesCount: number;

  repostedByMe: boolean;
  repliesCount: number;
  retweetsCount: number;

  viewsCount: number;
  bookmarkedByMe: boolean;

  onComment: () => void;
  onRepost: () => void;
  onLike: () => void;
  onBookmark: () => void;
}

export default function TweetActions({
  likedByMe,
  likesCount,
  repostedByMe,
  repliesCount,
  retweetsCount,
  viewsCount,
  bookmarkedByMe,
  onComment,
  onRepost,
  onLike,
  onBookmark,
}: TweetActionsProps) {
  return (
    <div className="mt-2 flex w-full items-center gap-5 text-muted-foreground">
      <button
        type="button"
        onClick={onComment}
        className="flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-primary"
      >
        <MessageCircle size={18} />

        {repliesCount > 0 && (
          <span className="text-sm">{formatCount(repliesCount)}</span>
        )}
      </button>

      <button
        type="button"
        onClick={onRepost}
        aria-pressed={repostedByMe}
        className={cn(
          "flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-emerald-500",
          repostedByMe && "text-emerald-500",
        )}
      >
        <Repeat2 size={18} />

        {retweetsCount > 0 && (
          <span className="text-sm">{formatCount(retweetsCount)}</span>
        )}
      </button>

      <button
        type="button"
        onClick={onLike}
        aria-pressed={likedByMe}
        className={cn(
          "flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-rose-500",
          likedByMe && "text-rose-500",
        )}
      >
        <HeartIcon size={18} filled={likedByMe} />

        {likesCount > 0 && (
          <span className="text-sm">{formatCount(likesCount)}</span>
        )}
      </button>

      <div className="ml-auto flex items-center gap-1">
        <div
          className="flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 cursor-default select-none"
          title="Views"
          aria-label={`${viewsCount} views`}
        >
          <Eye size={18} />

          <span className="text-sm">{formatCount(viewsCount)}</span>
        </div>

        <button
          type="button"
          onClick={onBookmark}
          aria-pressed={bookmarkedByMe}
          className={cn(
            "ml-auto flex min-w-0 items-center justify-center gap-2 rounded-full p-0.5 transition-colors hover:text-primary",
            bookmarkedByMe && "text-primary",
          )}
        >
          <Bookmark size={18} fill={bookmarkedByMe ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
