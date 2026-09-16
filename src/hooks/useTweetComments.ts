import { useCallback, useEffect, useState } from "react";

import { commentApi } from "@/api/comment.api";

import type { Tweet, ComposerSubmitData } from "@/types";

interface UseTweetCommentsOptions {
  postId: string;
  parentCommentId?: string | null;
  initialCount: number;
  initiallyOpen?: boolean;
}

export function useTweetComments({
  postId,
  parentCommentId = null,
  initialCount,
  initiallyOpen = false,
}: UseTweetCommentsOptions) {
  const [open, setOpen] = useState(initiallyOpen);
  const [comments, setComments] = useState<Tweet[]>([]);
  const [commentsCount, setCommentsCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommentsCount(initialCount);
  }, [initialCount]);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await commentApi.getByPostId(postId);

      setComments(result);
      setIsLoaded(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити коментарі.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const toggleOpen = async () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen && !isLoaded) await loadComments();
  };

  useEffect(() => {
    if (!initiallyOpen || isLoaded) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadComments();
  }, [initiallyOpen, isLoaded, loadComments]);

  const createComment = async (
    data: ComposerSubmitData,
    childParentCommentId?: string | null,
  ) => {
    if (isSubmitting) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      const parentId = childParentCommentId ?? parentCommentId ?? null;

      const created = await commentApi.create({
        postId,
        parentCommentId: parentId,
        content: data.content,
        mediaIds: data.mediaIds,
        poll: data.poll ?? undefined,
        location: data.location,
        linkPreview: data.linkPreview,
      });

      setComments((current) => [
        created,
        ...current.map((comment) =>
          comment.id === created.parentCommentId
            ? {
                ...comment,
                repliesCount: comment.repliesCount + 1,
              }
            : comment,
        ),
      ]);

      if ((created.parentCommentId ?? null) === parentCommentId) {
        setCommentsCount((count) => count + 1);
      }

      setIsLoaded(true);

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося створити коментар.",
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setError(null);

    const idsToDelete = new Set<string>([commentId]);

    let changed = true;

    while (changed) {
      changed = false;

      for (const comment of comments) {
        if (
          comment.parentCommentId &&
          idsToDelete.has(comment.parentCommentId) &&
          !idsToDelete.has(comment.id)
        ) {
          idsToDelete.add(comment.id);
          changed = true;
        }
      }
    }

    const deletedComment = comments.find((comment) => comment.id === commentId);

    try {
      await commentApi.delete(commentId);

      window.dispatchEvent(
        new CustomEvent("comment-deleted", {
          detail: { commentId },
        }),
      );

      setComments((current) =>
        current
          .filter((comment) => !idsToDelete.has(comment.id))
          .map((comment) =>
            deletedComment?.parentCommentId &&
            comment.id === deletedComment.parentCommentId
              ? {
                  ...comment,
                  repliesCount: Math.max(0, (comment.repliesCount ?? 0) - 1),
                }
              : comment,
          ),
      );

      const directRepliesDeleted = comments.filter(
        (comment) =>
          idsToDelete.has(comment.id) &&
          (comment.parentCommentId ?? null) === parentCommentId,
      ).length;

      setCommentsCount((count) =>
        Math.max(0, count - directRepliesDeleted),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося видалити коментар.",
      );
    }
  };

  const updateComment = async (
    commentId: string,
    data: ComposerSubmitData | string,
  ) => {
    setError(null);

    try {
      const payload = typeof data === "string" ? { content: data } : data;

      const updated = await commentApi.update(commentId, payload);

      window.dispatchEvent(
        new CustomEvent("comment-updated", {
          detail: { comment: updated },
        }),
      );

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId ? updated : comment,
        ),
      );

      return true;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не вдалося оновити коментар.",
      );

      return false;
    }
  };

  return {
    open,
    comments,
    commentsCount,

    isLoading,
    isSubmitting,
    error,

    toggleOpen,
    loadComments,

    createComment,
    deleteComment,
    updateComment,
  };
}
