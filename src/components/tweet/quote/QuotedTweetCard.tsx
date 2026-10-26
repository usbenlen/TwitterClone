import { PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Avatar, TwemojiText, VerifiedBadge } from "@/ui/index";

import { LinkPreviewCard } from "@/components/tweet/linkPreview/index";
import TweetLocation from "@/components/tweet/location/TweetLocation";
import TweetMedia from "@/components/tweet/TweetMedia";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import QuotedPoll from "@/components/tweet/quote/QuotedPoll";

import { useClickOrDrag } from "@/hooks";

import { APP_ROUTES } from "@/constants/routes";

import { cn, formatRelativeTime, removePreviewUrl } from "@/utils";
import { normalizeDisplayText, normalizeInlineDisplayText } from "@/utils/displayText";

import type { TweetQuote } from "@/types";

interface QuotedTweetCardProps {
  quote: TweetQuote;
  readOnly?: boolean;
  allowVoting?: boolean;
}

export default function QuotedTweetCard({
  quote,
  readOnly = false,
  allowVoting = true,
}: QuotedTweetCardProps) {
  const navigate = useNavigate();
  const target = quote.target;

  const clickOrDragHandlers = useClickOrDrag(
    () => navigate(APP_ROUTES.post(quote.targetId)),
    {
      ignoreSelector:
        'button, a, textarea, input, video, [data-quote-interactive="true"]',
    },
  );

  if (!target) {
    return (
      <div className="mt-3 rounded-2xl border border-border px-4 py-6 text-sm text-muted-foreground">
        {quote.targetType === "comment"
          ? "Цей коментар недоступний"
          : "Цей пост недоступний"}
      </div>
    );
  }

  const authorName = normalizeInlineDisplayText(target.author.displayName || target.author.username);
  const displayContent = normalizeDisplayText(removePreviewUrl(target.content, target.linkPreview?.url));
  const savedReplyingToUsernames = quote.replyingToUsernames ?? [];
  const replyingToUsernames =
    savedReplyingToUsernames.length > 0
      ? savedReplyingToUsernames
      : target.replyToUsername
        ? [target.replyToUsername]
        : [];

  return (
    <article
      {...clickOrDragHandlers}
      data-tweet-interactive="true"
      className="mt-3 cursor-pointer overflow-hidden rounded-2xl border border-border bg-quote-surface transition-colors hover:bg-quote-hover active:bg-quote-hover focus-visible:focus-indicator"
      aria-label={`Відкрити ${quote.targetType === "comment" ? "коментар" : "пост"} @${target.author.username}`}
    >
      <div
        className={cn(
          "p-3",
          target.location && target.attachments.length === 0 && "pb-0",
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px]">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <Link
              to={APP_ROUTES.profile(target.author.username)}
              className="block size-6 shrink-0"
            >
              <Avatar
                userId={target.author.id}
                name={authorName}
                fallbackName={target.author.username}
                src={target.author.avatarUrl}
                className="size-6 text-[10px] leading-none"
              />
            </Link>

            <Link
              to={APP_ROUTES.profile(target.author.username)}
              className="min-w-0 truncate font-bold hover:underline"
            >
              {authorName}
            </Link>

            <VerifiedBadge user={target.author} className="size-4 shrink-0" />
          </div>

          <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
            <span className="truncate">@{normalizeInlineDisplayText(target.author.username)}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">
              {formatRelativeTime(target.createdAt)}
            </span>
          </span>
        </div>

        {target.isComment && replyingToUsernames.length > 0 && (
          <p className="mt-1 min-w-0 overflow-hidden wrap-anywhere text-sm text-muted-foreground">
            У відповідь{" "}
            {replyingToUsernames.map((username, index) => (
              <span key={username}>
                {index > 0 &&
                  (index === replyingToUsernames.length - 1 ? " та " : ", ")}
                <Link
                  to={APP_ROUTES.profile(username)}
                  className="text-primary hover:underline"
                >
                  @{normalizeInlineDisplayText(username)}
                </Link>
              </span>
            ))}
          </p>
        )}

        {displayContent && (
          <TwemojiText
            text={displayContent}
            className="mt-1 block min-w-0 overflow-hidden wrap-anywhere whitespace-pre-wrap text-[15px]"
          />
        )}

        {target.poll && (
          <div data-quote-interactive="true">
            {readOnly ? (
              <TweetPoll
                tweetId={quote.targetId}
                poll={target.poll}
                isComment={quote.targetType === "comment"}
                readOnly
              />
            ) : (
              <QuotedPoll
                target={{ id: quote.targetId, type: quote.targetType }}
                snapshot={target.poll}
                allowVoting={allowVoting}
              />
            )}
          </div>
        )}

        {target.linkPreview && (
          <LinkPreviewCard preview={target.linkPreview} compact />
        )}
      </div>

      {target.attachments.length > 0 && (
        <div data-quote-interactive="true">
          <TweetMedia
            attachments={target.attachments}
            autoPlayVideos
            variant="quote"
          />
        </div>
      )}

      {target.location && (
        <div className="px-3 pb-3">
          <TweetLocation location={target.location} />
        </div>
      )}

      {quote.hasNewVersion && (
        <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-sm text-muted-foreground">
          <PenLine className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Відредаговано</span>
        </div>
      )}
    </article>
  );
}
