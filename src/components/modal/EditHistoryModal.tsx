import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, X } from "lucide-react";

import { commentApi, tweetApi } from "@/api";
import TweetContent from "@/components/tweet/TweetContent";
import { Avatar, Button, Spinner } from "@/ui";

import type { EditHistoryResponse, Tweet } from "@/types";

interface EditHistoryModalProps {
  open: boolean;
  tweet: Pick<Tweet, "id" | "isComment">;
  onClose: () => void;
}

function formatVersionDate(value: string) {
  return new Date(value).toLocaleString("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EditHistoryModal({
  open,
  tweet,
  onClose,
}: EditHistoryModalProps) {
  const [history, setHistory] = useState<EditHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = tweet.isComment
        ? await commentApi.getEditHistory(tweet.id)
        : await tweetApi.getEditHistory(tweet.id);
      setHistory(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не вдалося завантажити історію редагувань.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [tweet.id, tweet.isComment]);

  useEffect(() => {
    if (!open) return;
    const loadFrame = requestAnimationFrame(() => {
      void load();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(loadFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [load, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-start justify-center bg-black/50 p-0 sm:p-4 sm:pt-12"
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
                const authorName =
                  version.author.displayName || version.author.username;

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
                        {formatVersionDate(
                          version.updatedAt ?? version.createdAt,
                        )}
                      </time>
                    </div>

                    <div className="flex gap-3">
                      <Avatar
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
                          {version.author.isVerified && (
                            <BadgeCheck
                              className="size-4 shrink-0 text-background"
                              fill="#1d9bf0"
                              aria-label="Підтверджений акаунт"
                            />
                          )}
                          <span className="truncate text-muted-foreground">
                            @{version.author.username}
                          </span>
                        </div>
                        <TweetContent tweet={version} readOnly />
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
