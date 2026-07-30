/** @format */

import { CommentIcon, HeartIcon, RetweetIcon } from "@/shared/icons";

import { cn } from "@/utils/cn";
import { formatCount } from "@/utils/format";

interface TweetActionsProps {
  likedByMe: boolean;
  likesCount: number;

  repliesCount: number;
  retweetsCount: number;

  onLike: () => void;
}

export default function TweetActions({
  likedByMe,
  likesCount,
  repliesCount,
  retweetsCount,
  onLike,
}: TweetActionsProps) {
  return (
    <div className="mt-3 flex w-full items-center justify-between text-muted-foreground">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full p-2 transition-colors hover:text-primary"
      >
        <CommentIcon size={18} />

        {repliesCount > 0 && (
          <span className="text-sm">{formatCount(repliesCount)}</span>
        )}
      </button>

      <button
        type="button"
        className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full p-2 transition-colors hover:text-emerald-500"
      >
        <RetweetIcon size={18} />

        {retweetsCount > 0 && (
          <span className="text-sm">{formatCount(retweetsCount)}</span>
        )}
      </button>

      <button
        type="button"
        onClick={onLike}
        aria-pressed={likedByMe}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full p-2 transition-colors hover:text-rose-500",
          likedByMe && "text-rose-500",
        )}
      >
        <HeartIcon size={18} filled={likedByMe} />

        {likesCount > 0 && (
          <span className="text-sm">{formatCount(likesCount)}</span>
        )}
      </button>
    </div>
  );
}
