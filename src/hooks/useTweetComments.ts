import { useState } from "react";
import {
  errorMessage,
  useGetPostsQuery,
  useCreateCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "@/store/postsApi";
import type { Tweet, ComposerSubmitData } from "@/types";

interface UseTweetCommentsOptions {
  postId: string;
  parentCommentId?: string | null;
  initialCount: number;
  initiallyOpen?: boolean;
}
const EMPTY: Tweet[] = [];

export function useTweetComments({
  postId,
  parentCommentId = null,
  initialCount,
  initiallyOpen = false,
}: UseTweetCommentsOptions) {
  const [open, setOpen] = useState(initiallyOpen);
  const [requested, setRequested] = useState(initiallyOpen);
  const query = useGetPostsQuery(
    { kind: "comments", postId },
    { skip: !requested },
  );
  const [create, creating] = useCreateCommentMutation();
  const [update, updating] = useUpdatePostMutation();
  const [remove, removing] = useDeletePostMutation();
  const comments = query.currentData ?? EMPTY;
  const mutationError = creating.error ?? updating.error ?? removing.error;
  const clearErrors = () => {
    creating.reset();
    updating.reset();
    removing.reset();
  };

  return {
    open,
    comments,
    commentsCount: query.currentData
      ? comments.filter(
          (comment) => (comment.parentCommentId ?? null) === parentCommentId,
        ).length
      : initialCount,
    isLoading: query.isLoading,
    isSubmitting: creating.isLoading,
    error:
      mutationError || query.error
        ? errorMessage(mutationError ?? query.error)
        : null,

    toggleOpen: () => {
      setOpen(!open);
      if (!open) setRequested(true);
    },

    loadComments: () => {
      if (requested) void query.refetch();
      else setRequested(true);
    },

    createComment: async (
      data: ComposerSubmitData,
      childParentCommentId?: string | null,
    ) => {
      if (creating.isLoading) return false;
      clearErrors();
      try {
        await create({
          postId,
          parentCommentId:
            childParentCommentId === undefined
              ? parentCommentId
              : childParentCommentId,
          ...data,
          poll: data.poll ?? undefined,
        }).unwrap();
        return true;
      } catch {
        return false;
      }
    },

    deleteComment: async (id: string) => {
      clearErrors();
      await remove({ id, type: "comment" }).unwrap();
    },

    updateComment: async (id: string, data: ComposerSubmitData | string) => {
      clearErrors();
      try {
        await update({
          id,
          type: "comment",
          data: typeof data === "string" ? { content: data } : data,
        }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
  };
}
