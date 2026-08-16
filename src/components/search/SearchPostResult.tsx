import { Avatar } from "@/ui";

import type { Tweet } from "@/types";

interface SearchPostResultProps {
  tweet: Tweet;
  onClick?: () => void;
}

export default function SearchPostResult({
  tweet,
  onClick,
}: SearchPostResultProps) {
  const displayName = tweet.author.displayName?.trim() || tweet.author.username;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <Avatar
        name={displayName}
        src={tweet.author.avatarUrl ?? undefined}
        className="size-8"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">{displayName}</span>

          <span className="truncate text-xs text-muted-foreground">
            @{tweet.author.username}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-foreground">
          {tweet.content}
        </p>
      </div>
    </button>
  );
}
