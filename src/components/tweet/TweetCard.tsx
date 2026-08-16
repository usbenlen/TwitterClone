import { useState } from "react";
import { useNavigate } from "react-router";

import { tweetApi } from "@/api/tweet.api";

import {
  useAuth,
  useTweetLike,
  useTweetRepost,
  useTweetBookmark,
  useTweetComments,
  useClickOrDrag,
} from "@/hooks";

import { EditModal } from "@/components/modal";

import { Avatar } from "@/ui";

import {
  TweetHeader,
  TweetActions,
  TweetComments,
  TweetContent,
} from "@/components/tweet";
import { CommentModal } from "@/components/modal";

import { APP_ROUTES } from "@/constants/routes";

import type { Tweet, Comment } from "@/types";

interface TweetCardProps {
  tweet: Tweet;
  navigateToPost?: boolean;
  commentsInitiallyOpen?: boolean;
  variant?: "feed" | "post";
}

export default function TweetCard({
  tweet,
  navigateToPost = true,
  commentsInitiallyOpen = false,
  variant = "feed",
}: TweetCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentModalTarget, setCommentModalTarget] = useState<Comment | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const isOwnTweet = user?.id === tweet.author.id;

  const handleDelete = async () => {
    try {
      await tweetApi.delete(tweet.id);
      window.dispatchEvent(
        new CustomEvent("tweet-deleted", { detail: { tweetId: tweet.id } }),
      );
      if (variant === "post") {
        navigate(APP_ROUTES.HOME);
      }
    } catch (error) {
      console.error("Failed to delete tweet", error);
    }
  };

  const handleUpdate = async (content: string) => {
    try {
      const updatedTweet = await tweetApi.update(tweet.id, { content });
      window.dispatchEvent(
        new CustomEvent("tweet-updated", { detail: { tweet: updatedTweet } }),
      );
    } catch (error) {
      console.error("Failed to update tweet", error);
      throw error;
    }
  };

  const like = useTweetLike(tweet);
  const repost = useTweetRepost(tweet);
  const bookmark = useTweetBookmark(tweet);

  const comments = useTweetComments(
    tweet.id,
    tweet.repliesCount,
    commentsInitiallyOpen,
  );

  const openCommentModal = (comment: Comment | null = null) => {
    setCommentModalTarget(comment);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentModalTarget(null);
  };

  const clickOrDragHandlers = useClickOrDrag(() => {
    if (!navigateToPost || isCommentModalOpen) return;

    navigate(APP_ROUTES.post(tweet.id));
  });

  return (
    <>
      <article
        {...(navigateToPost ? clickOrDragHandlers : {})}
        className={`grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border px-4 py-3 transition-colors ${
          navigateToPost ? "cursor-pointer hover:bg-muted/40" : ""
        }`}
      >
        <div className="flex justify-center">
          <Avatar
            name={tweet.author.displayName}
            fallbackName={tweet.author.username}
            src={tweet.author.avatarUrl}
            className="size-11 shrink-0"
          />
        </div>

        <div className="min-w-0">
          <TweetHeader
            author={tweet.author}
            createdAt={tweet.createdAt}
            updatedAt={tweet.updatedAt}
            onDelete={isOwnTweet ? handleDelete : undefined}
            onEdit={isOwnTweet ? () => setIsEditModalOpen(true) : undefined}
          />

          <TweetContent tweet={tweet} />

          <TweetActions
            likedByMe={like.likedByMe}
            likesCount={like.likesCount}
            repostedByMe={repost.repostedByMe}
            repliesCount={comments.commentsCount}
            retweetsCount={repost.repostsCount}
            viewsCount={tweet.viewsCount}
            bookmarkedByMe={bookmark.bookmarkedByMe}
            onComment={() => openCommentModal()}
            onRepost={repost.toggleRepost}
            onLike={like.toggleLike}
            onBookmark={bookmark.toggleBookmark}
          />
        </div>
      </article>

      {variant === "post" && !navigateToPost && comments.open && (
        <TweetComments
          comments={comments.comments}
          isLoading={comments.isLoading}
          isSubmitting={comments.isSubmitting}
          error={comments.error}
          replyingToUsername={tweet.author.username}
          onSubmit={async (content) => {
            return comments.createComment(content, null);
          }}
          onDelete={comments.deleteComment}
          onUpdate={comments.updateComment}
          onOpenReplyModal={openCommentModal}
        />
      )}

      <EditModal
        open={isEditModalOpen}
        title="Редагувати пост"
        initialContent={tweet.content}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
      />

      <CommentModal
        open={isCommentModalOpen}
        tweet={tweet}
        replyTo={commentModalTarget}
        onClose={closeCommentModal}
        onSubmit={comments.createComment}
        isSubmitting={comments.isSubmitting}
      />
    </>
  );
}
