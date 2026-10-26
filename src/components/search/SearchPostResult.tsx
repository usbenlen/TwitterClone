import { Avatar } from "@/ui";
import { normalizeDisplayText, normalizeInlineDisplayText } from "@/utils/displayText";

import type { Tweet } from "@/types";

interface SearchPostResultProps {
  tweet: Tweet;
  onClick?: () => void;
}

export default function SearchPostResult({
  tweet,
  onClick,
}: SearchPostResultProps) {
  const displayName = normalizeInlineDisplayText(tweet.author.displayName?.trim() || tweet.author.username);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 dark:hover:bg-row-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
    >
      <Avatar
        userId={tweet.author.id}
        fallbackName={tweet.author.username}
        name={displayName}
        src={tweet.author.avatarUrl ?? undefined}
        className="size-8"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">{displayName}</span>

          <span className="truncate text-xs text-muted-foreground">
            @{normalizeInlineDisplayText(tweet.author.username)}
          </span>
        </div>

        <p className="mt-1 min-w-0 line-clamp-2 wrap-anywhere text-sm text-foreground">
          {normalizeDisplayText(tweet.content)}
        </p>
      </div>
    </button>
  );
}
