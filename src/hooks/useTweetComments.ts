import { useEffect, useState } from "react";

import { commentApi } from "@/api/comment.api";

import type { Comment } from "@/types/comment";

export function useTweetComments(
  postId: string,
  initialCount: number,
  initiallyOpen = false,
) {
  const [open, setOpen] = useState(initiallyOpen);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await commentApi.getByPostId(postId);
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
  };

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !isLoaded) {
      await loadComments();
    }
  };

  useEffect(() => {
    if (!initiallyOpen || isLoaded) return;

    void loadComments();
  }, [initiallyOpen, isLoaded]);

  const createComment = async (
    content: string,
    parentCommentId?: string | null,
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await commentApi.create({
        postId,
        parentCommentId: parentCommentId ?? null,
        content,
      });

      setComments((current) => [...current, created]);
      setCommentsCount((count) => count + 1);
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

    try {
      await commentApi.delete(commentId);
      setComments((current) => current.filter((item) => item.id !== commentId));
      setCommentsCount((count) => Math.max(0, count - 1));
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
    createComment,
    deleteComment,
  };
}
