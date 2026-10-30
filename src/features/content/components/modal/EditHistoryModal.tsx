import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useGetHistoryQuery } from "@/features/content/api/postQueries";
import PostContent from "@/features/content/components/posts/PostContent";
import { targetOf } from "@/features/content/model/postTargets";
import { VerifiedBadge } from "@/features/profiles/components/VerifiedBadge";
import { useBodyScrollLock } from "@/shared/hooks";
import { normalizeInlineDisplayText } from "@/shared/lib/displayText";
import { formatDateTime } from "@/shared/lib/format";
import { errorMessage } from "@/shared/store/appApi";
import { Avatar, Button, Spinner } from "@/shared/ui";

import type { Post } from "@/features/content/types";

interface EditHistoryModalProps {
  open: boolean;
  post: Pick<Post, "id" | "isComment">;
  onClose: () => void;
}

export default function EditHistoryModal({
  open,
  post,
  onClose,
}: EditHistoryModalProps) {
  const query = useGetHistoryQuery(targetOf(post), { skip: !open });
  const history = query.currentData;
  const isLoading = query.isFetching;
  const error = query.error ? errorMessage(query.error) : null;
  const load = () => {
    void query.refetch();
  };

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-start justify-center modal-backdrop p-0 sm:p-4 sm:pt-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-history-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="flex h-full w-full max-w-150 flex-col overflow-hidden bg-background shadow-xl sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:border-border">
        <header className="flex shrink-0 items-center gap-4 border-b border-border px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Закрити історію редагувань"
          >
            <X className="size-5" />
          </button>
          <h2 id="edit-history-title" className="text-xl font-bold">
            Історія редагувань
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={load}
              >
                Спробувати ще раз
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history?.versions.map((version, index) => {
                const isFirst = index === 0;
                const isCurrent = index === history.versions.length - 1;
                const label = isCurrent
                  ? "Поточна версія"
                  : isFirst
                    ? "Початкова версія"
                    : `Версія ${index + 1}`;
                const authorName = normalizeInlineDisplayText(version.author.displayName || version.author.username);

                return (
                  <article key={version.versionId} className="px-4 py-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={
                          isCurrent
                            ? "font-semibold text-primary"
                            : "font-semibold text-muted-foreground"
                        }
                      >
                        {label}
                      </span>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(version.updatedAt ?? version.createdAt)}
                      </time>
                    </div>

                    <div className="flex gap-3">
                      <Avatar
                        userId={version.author.id}
                        name={authorName}
                        fallbackName={version.author.username}
                        src={version.author.avatarUrl}
                        className="size-10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1 text-sm">
                          <span className="truncate font-bold">
                            {authorName}
                          </span>
                          <VerifiedBadge
                            user={version.author}
                            className="size-4"
                          />
                          <span className="truncate text-muted-foreground">
                            @{normalizeInlineDisplayText(version.author.username)}
                          </span>
                        </div>
                        <PostContent post={version} readOnly />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
