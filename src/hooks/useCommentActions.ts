import { useState } from "react";

import { commentApi } from "@/api/comment.api";

import type { Comment } from "@/types/comment";

export function useCommentActions(comment: Comment) {
  const [likedByMe, setLikedByMe] = useState(
    Boolean(comment.isLikedByCurrentUser),
  );

  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const [repostedByMe, setRepostedByMe] = useState(
    Boolean(comment.isRepostedByCurrentUser),
  );

  const [repostsCount, setRepostsCount] = useState(comment.retweetsCount ?? 0);

  const [bookmarkedByMe, setBookmarkedByMe] = useState(
    Boolean(comment.isBookmarkedByCurrentUser),
  );

  const [pendingAction, setPendingAction] = useState(false);

  const toggleLike = async () => {
    if (pendingAction) return;

    const previous = {
      likedByMe,
      likesCount,
    };

    const nextLiked = !likedByMe;

    setLikedByMe(nextLiked);
    setLikesCount((count) => (nextLiked ? count + 1 : Math.max(0, count - 1)));

    setPendingAction(true);

    try {
      const result = await commentApi.toggleLike(
        comment.id,
        previous.likedByMe,
      );

      setLikedByMe(result.isLikedByCurrentUser);
      setLikesCount(result.likesCount);
    } catch {
      setLikedByMe(previous.likedByMe);
      setLikesCount(previous.likesCount);
    } finally {
      setPendingAction(false);
    }
  };

  const toggleRepost = async () => {
    if (pendingAction) return;

    const previous = {
      repostedByMe,
      repostsCount,
    };

    const nextReposted = !repostedByMe;

    setRepostedByMe(nextReposted);
    setRepostsCount((count) =>
      nextReposted ? count + 1 : Math.max(0, count - 1),
    );

    setPendingAction(true);

    try {
      const result = await commentApi.toggleRepost(
        comment.id,
        previous.repostedByMe,
      );

      setRepostedByMe(result.isRepostedByCurrentUser);
      setRepostsCount(result.retweetsCount);
    } catch {
      setRepostedByMe(previous.repostedByMe);
      setRepostsCount(previous.repostsCount);
    } finally {
      setPendingAction(false);
    }
  };

  const toggleBookmark = async () => {
    if (pendingAction) return;

    const previous = bookmarkedByMe;
    const nextBookmarked = !previous;

    setBookmarkedByMe(nextBookmarked);
    setPendingAction(true);

    try {
      const result = await commentApi.toggleBookmark(comment.id, previous);

      setBookmarkedByMe(result.isBookmarkedByCurrentUser);
    } catch {
      setBookmarkedByMe(previous);
    } finally {
      setPendingAction(false);
    }
  };

  return {
    likedByMe,
    likesCount,

    repostedByMe,
    repostsCount,

    bookmarkedByMe,

    viewsCount: comment.viewsCount ?? 0,
    repliesCount: comment.repliesCount ?? 0,

    pendingAction,

    toggleLike,
    toggleRepost,
    toggleBookmark,
  };
}
