/** @format */

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Avatar,
  Button,
  EmojiTextarea,
} from "@/ui";

import {
  CommentList,
  CommentToolbar,
} from "@/components/tweet/comment";

import EmojiPicker from "@/components/composer/emoji/EmojiPicker";

import { useAuth } from "@/hooks/useAuth";

import type { Comment } from "@/types/comment";

interface TweetCommentsProps {
  comments: Comment[];

  isLoading: boolean;
  isSubmitting: boolean;

  error?: string | null;

  replyingToUsername: string;

  onSubmit: (
      content: string,
      parentCommentId?: string | null,
  ) => Promise<boolean>;

  onDelete: (
      commentId: string,
  ) => Promise<void>;

  onOpenReplyModal: (
      comment: Comment,
  ) => void;
}

function groupReplies(
    comments: Comment[],
) {
  const commentIds = new Set(
      comments.map(
          (comment) => comment.id,
      ),
  );

  const roots: Comment[] = [];

  const repliesByParentId = new Map<
      string,
      Comment[]
  >();

  for (const comment of comments) {
    const parentId =
        comment.parentCommentId;

    if (
        !parentId ||
        !commentIds.has(parentId)
    ) {
      roots.push(comment);
      continue;
    }

    const replies =
        repliesByParentId.get(parentId) ??
        [];

    replies.push(comment);

    repliesByParentId.set(
        parentId,
        replies,
    );
  }

  return {
    roots,
    repliesByParentId,
  };
}

export default function TweetComments({
                                        comments,
                                        isLoading,
                                        isSubmitting,
                                        error,
                                        replyingToUsername,
                                        onSubmit,
                                        onDelete,
                                        onOpenReplyModal,
                                      }: TweetCommentsProps) {
  const { user } = useAuth();

  const [content, setContent] =
      useState("");

  const [
    textareaFocused,
    setTextareaFocused,
  ] = useState(false);

  const [
    showEmojiPicker,
    setShowEmojiPicker,
  ] = useState(false);

  const textareaRef =
      useRef<HTMLTextAreaElement | null>(
          null,
      );

  const pickerRef =
      useRef<HTMLDivElement | null>(
          null,
      );

  //floating-ui
  const {
    refs,
    floatingStyles,
    update,
  } = useFloating({
    open: showEmojiPicker,

    strategy: "fixed",

    placement: "top-start",

    whileElementsMounted:
    autoUpdate,

    middleware: [
      offset(8),

      flip({
        padding: 8,
        fallbackAxisSideDirection: "end",
      }),

      shift({
        padding: 8,
      }),
    ],
  });

  const {
    roots,
    repliesByParentId,
  } = useMemo(
      () => groupReplies(comments),
      [comments],
  );

  useEffect(() => {
    if (!showEmojiPicker) return;

    void update();
  }, [
    showEmojiPicker,
    update,
  ]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handlePointerDown = (
        event: PointerEvent,
    ) => {
      const target = event.target;

      if (
          target instanceof Node &&
          pickerRef.current?.contains(target)
      ) {
        return;
      }

      setShowEmojiPicker(false);
    };

    document.addEventListener(
        "pointerdown",
        handlePointerDown,
    );

    return () => {
      document.removeEventListener(
          "pointerdown",
          handlePointerDown,
      );
    };
  }, [showEmojiPicker]);

  const handleTextareaFocus = () => {
    if (textareaFocused) return;

    setTextareaFocused(true);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleEmojiSelect = (
      emoji: string,
  ) => {
    const textarea =
        textareaRef.current;

    if (!textarea) {
      setContent(
          (previous) =>
              previous + emoji,
      );

      setShowEmojiPicker(false);

      return;
    }

    const start =
        textarea.selectionStart;

    const end =
        textarea.selectionEnd;

    const nextValue =
        content.slice(0, start) +
        emoji +
        content.slice(end);

    const nextCursor =
        start + emoji.length;

    setContent(nextValue);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
          nextCursor,
          nextCursor,
      );
    });
  };

  const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedContent =
        content.trim();

    if (
        !normalizedContent ||
        isSubmitting
    ) {
      return;
    }

    const success =
        await onSubmit(
            normalizedContent,
            null,
        );

    if (!success) return;

    setContent("");
    setShowEmojiPicker(false)
  };

  return (
      <section
          data-tweet-interactive="true"
      >

        {/* Composer */}
        <form
            onSubmit={handleSubmit}
            className="border-b border-border px-4 py-3"
        >
          <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
            {/* Current user avatar */}
            <div className="flex justify-center">
              <Avatar
                  name={user?.displayName}
                  fallbackName={
                    user?.username
                  }
                  src={user?.avatarUrl}
                  className="size-10 shrink-0"
              />
            </div>

            <div
                className={`relative min-w-0 overflow-hidden transition-[max-height] duration-500 ease-out ${
                    textareaFocused ? "max-h-40" : "max-h-16"
                }`}
            >

              {/* Compact state */}
              {!textareaFocused && (
                  <div className="flex items-center gap-3">
                    <EmojiTextarea
                        ref={textareaRef}
                        value={content}
                        onChange={(event) => {
                          setContent(
                              event.target.value,
                          );
                        }}
                        onFocus={
                          handleTextareaFocus
                        }
                        placeholder="Post your reply"
                        className="min-h-12 flex-1 py-1.5 text-[18px]"
                        rows={1}
                        disabled={
                          isSubmitting
                        }
                    />

                    <Button
                        type="submit"
                        disabled
                        className="shrink-0 self-center rounded-full px-5 h-9 font-bold text-[15px]"
                    >
                      Reply
                    </Button>
                  </div>
              )}

              {/* Expanded state */}
              {textareaFocused && (
                  <div className="relative">
                    <p className="text-sm text-muted-foreground">
                      Replying to{" "}
                      <span className="text-primary">
                    @{replyingToUsername}
                  </span>
                    </p>

                    {/* Expanded textarea */}
                    <EmojiTextarea
                        ref={textareaRef}
                        value={content}
                        onChange={(event) => {
                          setContent(
                              event.target.value,
                          );
                        }}
                        onFocus={
                          handleTextareaFocus
                        }
                        placeholder="Post your reply"
                        className="min-h-12 flex-1 py-1.5 text-[18px]"
                        rows={1}
                        disabled={
                          isSubmitting
                        }
                    />

                    {/* Composer actions */}
                      <div className="flex items-center justify-between gap-3">
                        <CommentToolbar
                            disabled={
                              isSubmitting
                            }
                            showEmojiPicker={
                              showEmojiPicker
                            }
                            onToggleEmoji={() => {
                              setShowEmojiPicker(
                                  (previous) =>
                                      !previous,
                              );
                            }}
                            emojiButtonRef={
                              refs.setReference
                            }
                        />

                        <Button
                            type="submit"
                            disabled={
                                !content.trim() ||
                                isSubmitting
                            }
                            isLoading={
                              isSubmitting
                            }
                            className="shrink-0 self-center rounded-full px-5 h-9 font-bold text-[15px]"
                        >
                          Reply
                        </Button>
                      </div>
                  </div>
              )}

              {showEmojiPicker && (
                  <FloatingPortal>
                    <div
                        ref={(node) => {
                          pickerRef.current =
                              node;

                          refs.setFloating(node);
                        }}
                        style={
                          floatingStyles
                        }
                        className="z-[9999] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                    >
                      <EmojiPicker
                          onSelect={
                            handleEmojiSelect
                          }
                      />
                    </div>
                  </FloatingPortal>
              )}
            </div>
          </div>
        </form>

        {error && (
            <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
        )}

        {/* Comments */}
        {isLoading ? (
            <p className="py-4 text-sm text-muted-foreground">
              Завантаження коментарів...
            </p>
        ) : comments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Поки що немає коментарів.
              Будьте першим.
            </p>
        ) : (
            <CommentList
                comments={roots}
                repliesByParentId={
                  repliesByParentId
                }
                currentUserId={user?.id}
                onReply={
                  onOpenReplyModal
                }
                onDelete={onDelete}
            />
        )}
      </section>
  );
}