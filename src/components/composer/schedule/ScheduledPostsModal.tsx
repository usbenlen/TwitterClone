import { createPortal } from "react-dom";
import { ArrowLeft, CalendarClock, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import ScheduledPostEditModal from "@/components/composer/schedule/ScheduledPostEditModal";
import { ConfirmModal } from "@/components/modal";
import { useScheduledPosts } from "@/hooks/useScheduledPosts.ts";
import { Spinner, TwemojiText } from "@/ui";

import type { ScheduledPost } from "@/types";

interface ScheduledPostsModalProps {
  open: boolean;
  onBack: () => void;
  onClose: () => void;
}

export default function ScheduledPostsModal({
  open,
  onBack,
  onClose,
}: ScheduledPostsModalProps) {
  const { posts, isLoading, error, update, remove } = useScheduledPosts();
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  const [deleting, setDeleting] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !editing && !deleting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [deleting, editing, onClose, open]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal flex items-start justify-center bg-black/50 p-0 sm:p-4 sm:pt-16"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduled-posts-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="flex h-full w-full max-w-2xl flex-col bg-background shadow-xl sm:h-auto sm:max-h-[calc(100vh-8rem)] sm:rounded-2xl">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={onBack}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Назад до планування"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 id="scheduled-posts-title" className="flex-1 text-xl font-bold">
              Заплановані дописи
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Закрити"
            >
              <X size={22} />
            </button>
          </header>

          <div className="overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center p-10">
                <Spinner />
              </div>
            )}
            {error && <p className="p-6 text-destructive">{error}</p>}
            {!isLoading && !error && posts.length === 0 && (
              <p className="p-10 text-center text-muted-foreground">
                Запланованих дописів поки немає.
              </p>
            )}
            {posts.map((post) => (
              <article
                key={post.id}
                className="border-b border-border p-5 last:border-b-0"
              >
                <div className="flex gap-4">
                  {post.media[0] && (
                    <img
                      src={post.media[0].url}
                      alt=""
                      className="size-20 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-3 text-[15px]">
                      {post.content ? (
                        <TwemojiText text={post.content} />
                      ) : (
                        <span className="text-muted-foreground">
                          Медіадопис
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock size={16} />
                      {new Intl.DateTimeFormat("uk-UA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(post.scheduledAt))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(post)}
                      className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
                      aria-label="Редагувати допис"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(post)}
                      className="flex size-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                      aria-label="Скасувати допис"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <ScheduledPostEditModal
          key={`${editing.id}-${editing.scheduledAt}`}
          post={editing}
          onClose={() => setEditing(null)}
          onSave={async (request) => {
            await update(editing.id, request);
            setEditing(null);
          }}
        />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Скасувати запланований допис?"
        description="Допис і збережені для нього вкладення буде видалено з черги."
        confirmText="Скасувати допис"
        cancelText="Залишити"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) void remove(deleting.id);
          setDeleting(null);
        }}
      />
    </>,
    document.body,
  );
}
