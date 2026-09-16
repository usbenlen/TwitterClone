import { BadgeCheck, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Avatar, TwemojiText } from "@/ui";

import { LinkPreviewCard } from "@/components/tweet/linkPreview";
import TweetLocation from "@/components/tweet/location/TweetLocation";
import TweetMedia from "@/components/tweet/TweetMedia";
import TweetPoll from "@/components/tweet/poll/TweetPoll";

import { useClickOrDrag } from "@/hooks";

import { APP_ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format";
import { removePreviewUrl } from "@/utils/linkPreview";

import type { TweetQuote } from "@/types";

interface QuotedTweetCardProps {
  quote: TweetQuote;
}

export default function QuotedTweetCard({ quote }: QuotedTweetCardProps) {
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

  const authorName = target.author.displayName || target.author.username;
  const displayContent = removePreviewUrl(
    target.content,
    target.linkPreview?.url,
  );
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
      className="mt-3 cursor-pointer overflow-hidden rounded-2xl border border-border transition-colors hover:bg-muted/40"
      aria-label={`Відкрити ${quote.targetType === "comment" ? "коментар" : "пост"} @${target.author.username}`}
    >
      <div className="p-3">
        <div className="flex min-w-0 items-center gap-2 text-[15px]">
          <Link
            to={APP_ROUTES.profile(target.author.username)}
            className="block size-6 shrink-0"
          >
            <Avatar
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

          {target.author.isVerified && (
            <BadgeCheck
              className="size-4 shrink-0 text-background"
              fill="#1d9bf0"
              aria-label="Підтверджений акаунт"
            />
          )}

          <span className="min-w-0 truncate text-muted-foreground">
            @{target.author.username}
          </span>
          <span className="shrink-0 text-muted-foreground">·</span>
          <span className="shrink-0 text-muted-foreground">
            {formatRelativeTime(target.createdAt)}
          </span>
        </div>

        {target.isComment && replyingToUsernames.length > 0 && (
          <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
            У відповідь{" "}
            {replyingToUsernames.map((username, index) => (
              <span key={username}>
                {index > 0 &&
                  (index === replyingToUsernames.length - 1 ? " та " : ", ")}
                <Link
                  to={APP_ROUTES.profile(username)}
                  className="text-primary hover:underline"
                >
                  @{username}
                </Link>
              </span>
            ))}
          </p>
        )}

        {displayContent && (
          <TwemojiText
            text={displayContent}
            className="mt-1 wrap-break-word whitespace-pre-wrap text-[15px]"
          />
        )}

        {target.poll && (
          <div data-quote-interactive="true">
            <TweetPoll tweetId={target.id} poll={target.poll} />
          </div>
        )}

        {target.linkPreview && (
          <LinkPreviewCard preview={target.linkPreview} compact />
        )}
        {target.location && <TweetLocation location={target.location} />}
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

      {quote.hasNewVersion && (
        <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-sm text-muted-foreground">
          <PenLine className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Відредаговано</span>
        </div>
      )}
    </article>
  );
}
