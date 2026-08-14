/** @format */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { commentApi } from "@/api/comment.api";

import type { Comment } from "@/types/comment";

export function useTweetComments(
    postId: string,
    initialCount: number,
    initiallyOpen = false,
) {
  const [open, setOpen] =
      useState(initiallyOpen);

  const [comments, setComments] =
      useState<Comment[]>([]);

  const [commentsCount, setCommentsCount] =
      useState(initialCount);

  const [isLoading, setIsLoading] =
      useState(false);

  const [isSubmitting, setIsSubmitting] =
      useState(false);

  const [error, setError] =
      useState<string | null>(null);

  const [isLoaded, setIsLoaded] =
      useState(false);

  const loadComments = useCallback(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result =
              await commentApi.getByPostId(
                  postId,
              );

          setComments(result);
          setCommentsCount(result.length);
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
      },
      [postId],
  );

  const toggleOpen = async () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen && !isLoaded) {
      await loadComments();
    }
  };

  useEffect(() => {
    if (
        !initiallyOpen ||
        isLoaded
    ) {
      return;
    }

    void loadComments();
  }, [
    initiallyOpen,
    isLoaded,
    loadComments,
  ]);

  const createComment = async (
      content: string,
      parentCommentId?: string | null,
  ) => {
    if (isSubmitting) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created =
          await commentApi.create({
            postId,
            parentCommentId:
                parentCommentId ?? null,
            content,
          });

      setComments((current) => {
        const next = [...current, created];

        if (!parentCommentId) {
          return next;
        }

        return next.map((comment) =>
            comment.id ===
            parentCommentId
                ? {
                  ...comment,
                  repliesCount:
                      (comment.repliesCount ??
                          0) + 1,
                }
                : comment,
        );
      });

      setCommentsCount(
          (count) => count + 1,
      );

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

  const deleteComment = async (
      commentId: string,
  ) => {
    setError(null);

    const idsToDelete =
        new Set<string>([commentId]);

    let changed = true;

    while (changed) {
      changed = false;

      for (const comment of comments) {
        if (
            comment.parentCommentId &&
            idsToDelete.has(
                comment.parentCommentId,
            ) &&
            !idsToDelete.has(comment.id)
        ) {
          idsToDelete.add(comment.id);
          changed = true;
        }
      }
    }

    const deletedComment =
        comments.find(
            (comment) =>
                comment.id === commentId,
        );

    try {
      await commentApi.delete(
          commentId,
      );

      setComments((current) =>
          current
              .filter(
                  (comment) =>
                      !idsToDelete.has(
                          comment.id,
                      ),
              )
              .map((comment) =>
                  deletedComment?.parentCommentId &&
                  comment.id ===
                  deletedComment.parentCommentId
                      ? {
                        ...comment,
                        repliesCount:
                            Math.max(
                                0,
                                (comment.repliesCount ??
                                    0) -
                                1,
                            ),
                      }
                      : comment,
              ),
      );

      setCommentsCount((count) =>
          Math.max(
              0,
              count - idsToDelete.size,
          ),
      );
    } catch (error) {
      setError(
          error instanceof Error
              ? error.message
              : "Не вдалося видалити коментар.",
      );
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
  };
}