import { Flag, PenLine, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { VerifiedBadge } from "@/features/profiles/components/VerifiedBadge";
import { APP_ROUTES } from "@/shared/config/routes";
import { normalizeInlineDisplayText } from "@/shared/lib/displayText";
import { formatRelativeTime } from "@/shared/lib/format";
import { ActionsMenu } from "@/shared/ui";

import type { Post } from "@/features/content/types";
import type { ActionsMenuItem } from "@/shared/ui/ActionsMenu";

interface PostHeaderProps {
  onReport?: () => void;
  author: Post["author"];
  createdAt: string;
  updatedAt?: string | null;
  replyToUsername?: string | null;
  replyToLabel?: string;
  replyToFallbackHref?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onOpenEditHistory?: () => void;
}

export default function PostHeader({
  author,
  createdAt,
  updatedAt,
  replyToUsername,
  replyToLabel = "У відповідь",
  replyToFallbackHref,
  onDelete,
  onEdit,
  onOpenEditHistory,
  onReport,
}: PostHeaderProps) {
  const actions: ActionsMenuItem[] = [
    ...(onReport
      ? [
          {
            id: "report",
            label: "Поскаржитися",
            icon: Flag,
            onSelect: onReport,
          },
        ]
      : []),
    ...(onEdit
      ? [{ id: "edit", label: "Редагувати", icon: Pencil, onSelect: onEdit }]
      : []),
    ...(onDelete
      ? [
          {
            id: "delete",
            label: "Видалити",
            icon: Trash2,
            onSelect: onDelete,
            variant: "danger" as const,
          },
        ]
      : []),
  ];
  return (
    <div className="relative flex flex-col gap-0.5 min-w-0">
      <div className="relative flex items-start justify-between gap-2 min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 pr-8 text-sm">
          <Link
            to={APP_ROUTES.profile(author.username)}
            className="min-w-0 max-w-full truncate font-bold text-foreground hover:underline"
          >
            {normalizeInlineDisplayText(author.displayName ?? "")}
          </Link>

          <VerifiedBadge user={author} size={18} />

          <span className="truncate text-muted-foreground">
            @{normalizeInlineDisplayText(author.username)}
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
                  title="Відредаговано"
                  className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Відкрити історію редагувань"
                >
                  <PenLine size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : (
                <span
                  className="shrink-0 text-muted-foreground"
                  title="Відредаговано"
                  role="img"
                  aria-label="Відредаговано"
                >
                  <PenLine size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              )}
            </>
          )}
        </div>

        {(onDelete || onEdit || onReport) && (
          <div className="absolute -right-2 -top-2">
            <ActionsMenu
              items={actions}
              ariaLabel="Додаткові дії"
              menuLabel="Дії з дописом"
            />
          </div>
        )}
      </div>

      {(replyToUsername || replyToFallbackHref) && (
        <div className="w-full min-w-0 text-xs text-muted-foreground">
          {replyToUsername ? (
            <>
              {replyToLabel}{" "}
              <Link
                to={APP_ROUTES.profile(replyToUsername)}
                onClick={(e) => e.stopPropagation()}
                className="inline-block max-w-full overflow-hidden align-bottom wrap-anywhere text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                @{normalizeInlineDisplayText(replyToUsername)}
              </Link>
            </>
          ) : replyToFallbackHref ? (
            <Link
              to={replyToFallbackHref}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Відповідь
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
