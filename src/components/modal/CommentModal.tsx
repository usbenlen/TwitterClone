import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

import { Avatar, Button, EmojiTextarea, TwemojiText } from "@/ui";

import EmojiPicker from "@/components/composer/emoji/EmojiPicker";
import { CommentToolbar } from "@/components/tweet/comment";

import type { Tweet, Comment } from "@/types";

interface CommentModalProps {
  open: boolean;
  tweet: Tweet;
  replyTo?: Comment | null;
  onClose: () => void;
  onSubmit: (
    content: string,
    parentCommentId?: string | null,
  ) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function CommentModal(props: CommentModalProps) {
  const { open, tweet, replyTo } = props;

  if (!open) return null;

  return (
    <CommentModalInner
      key={open ? `comment-modal-${replyTo?.id || tweet.id}` : "closed"}
      {...props}
    />
  );
}

function CommentModalInner({
  open,
  tweet,
  replyTo,
  onClose,
  onSubmit,
  isSubmitting,
}: CommentModalProps) {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        return;
      }

      if (!isSubmitting) onClose();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!showEmojiPicker) return;

      if (
        pickerRef.current &&
        event.target instanceof Node &&
        pickerRef.current.contains(event.target)
      ) {
        return;
      }

      setShowEmojiPicker(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, showEmojiPicker, isSubmitting, onClose]);

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((previous) => previous + emoji);

      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nextValue = content.slice(0, start) + emoji + content.slice(end);
    const nextCursor = start + emoji.length;

    setContent(nextValue);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = content.trim();
    if (!text || isSubmitting) return;

    const success = await onSubmit(text, replyTo?.id ?? null);
    if (!success) return;

    setContent("");
    setShowEmojiPicker(false);
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) onClose();
  };

  const authorName = tweet.author.displayName || tweet.author.username;

  const replyUsername = replyTo?.author.username || tweet.author.username;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Reply to post"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-background p-4 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            aria-label="Закрити"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            className="cursor-pointer text-sm font-semibold text-primary hover:underline"
          >
            Drafts
          </button>
        </div>

        <div className="grid grid-cols-[48px_1fr] gap-3">
          <div className="flex flex-col items-center">
            <Avatar
              name={tweet.author.displayName}
              fallbackName={tweet.author.username}
              src={tweet.author.avatarUrl}
              className="size-11"
            />

            <div
              className="mt-2 w-0.5 flex-1 bg-border"
              style={{ minHeight: 24 }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[15px]">
              <span className="truncate font-bold">{authorName}</span>

              <span className="truncate text-muted-foreground">
                @{tweet.author.username}
              </span>

              <span className="text-muted-foreground">·</span>

              <span className="text-sm text-muted-foreground">
                {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-1 text-[15px] leading-normal">
              <TwemojiText text={tweet.content} />
            </div>

            <p className="mt-3 text-[15px] text-muted-foreground">
              Replying to{" "}
              <span className="cursor-pointer text-primary hover:underline">
                @{replyUsername}
              </span>
            </p>

            {replyTo && (
              <div className="mt-2 rounded-xl bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Відповідь на коментар
                </p>

                <p className="mt-1 line-clamp-2 text-sm text-foreground">
                  {replyTo.content}
                </p>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-[48px_1fr] gap-3"
        >
          <div className="flex justify-center">
            <Avatar
              name={user?.displayName}
              fallbackName={user?.username}
              src={user?.avatarUrl}
              className="size-11"
            />
          </div>

          <div className="relative flex min-w-0 flex-col justify-between">
            <EmojiTextarea
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Post your reply"
              className="py-2 text-[17px]"
              rows={3}
              autoFocus
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <CommentToolbar
                disabled={isSubmitting}
                showEmojiPicker={showEmojiPicker}
                onToggleEmoji={() =>
                  setShowEmojiPicker((previous) => !previous)
                }
              />

              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="cursor-pointer rounded-full px-5 py-2 h-9 font-bold text-[15px]"
              >
                Reply
              </Button>
            </div>

            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-[52px] left-0 z-50 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              >
                <EmojiPicker onSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
