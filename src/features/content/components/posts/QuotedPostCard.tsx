import { PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router";

import LinkPreviewCard from "@/features/content/components/posts/LinkPreviewCard";
import PostLocation from "@/features/content/components/posts/PostLocation";
import PostMedia from "@/features/content/components/posts/PostMedia";
import PostPoll from "@/features/content/components/posts/PostPoll";
import QuotedPoll from "@/features/content/components/posts/QuotedPoll";
import { removePreviewUrl } from "@/features/content/lib/composer/linkPreview";
import { VerifiedBadge } from "@/features/profiles/components/VerifiedBadge";
import { APP_ROUTES } from "@/shared/config/routes";
import { useClickOrDrag } from "@/shared/hooks/useClickOrDrag";
import { cn } from "@/shared/lib/cn";
import {
  normalizeDisplayText,
  normalizeInlineDisplayText,
} from "@/shared/lib/displayText";
import { formatRelativeTime } from "@/shared/lib/format";
import { Avatar, TwemojiText } from "@/shared/ui";

import type { PostQuote } from "@/features/content/types";

interface QuotedPostCardProps {
  quote: PostQuote;
  readOnly?: boolean;
  allowVoting?: boolean;
}

export default function QuotedPostCard({
  quote,
  readOnly = false,
  allowVoting = true,
}: QuotedPostCardProps) {
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
      data-post-interactive="true"
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
              <PostPoll
                postId={quote.targetId}
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
          <PostMedia
            attachments={target.attachments}
            autoPlayVideos
            variant="quote"
          />
        </div>
      )}

      {target.location && (
        <div className="px-3 pb-3">
          <PostLocation location={target.location} />
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
