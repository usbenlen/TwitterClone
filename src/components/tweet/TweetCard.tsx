import { useState } from "react";
import { useNavigate } from "react-router";

import { commentApi } from "@/api/comment.api";
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
import {
  mapMediaToComposerMedia,
  mapPollToComposerPoll,
} from "@/utils/mappers";

import { cn } from "@/utils/cn";

import type { Tweet, ComposerSubmitData } from "@/types";

interface TweetCardProps {
  tweet: Tweet;
  navigateToPost?: boolean;
  commentsInitiallyOpen?: boolean;
  className?: string;
  variant?: "feed" | "post";
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpdateComment?: (
    commentId: string,
    data: ComposerSubmitData | string,
  ) => Promise<Tweet | false>;
}

export default function TweetCard({
  tweet,
  navigateToPost = true,
  commentsInitiallyOpen = false,
  className,
  variant = "feed",
  onDeleteComment,
  onUpdateComment,
}: TweetCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentModalTarget, setCommentModalTarget] = useState<Tweet | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwnTweet = user?.id === tweet.author.id;

  const handleDelete = async () => {
    try {
      if (tweet.isComment && onDeleteComment) {
        await onDeleteComment(tweet.id);
      } else if (tweet.isComment) {
        await commentApi.delete(tweet.id);
      } else {
        await tweetApi.delete(tweet.id);
      }

      window.dispatchEvent(
        new CustomEvent("tweet-deleted", {
          detail: { tweetId: tweet.id },
        }),
      );

      if (variant === "post" && !tweet.isComment) navigate(APP_ROUTES.HOME);
    } catch (error) {
      console.error("Failed to delete tweet", error);
    }
  };

  const handleUpdate = async (data: ComposerSubmitData) => {
    try {
      const updatedTweet =
        tweet.isComment && onUpdateComment
          ? await onUpdateComment(tweet.id, data)
          : tweet.isComment
            ? await commentApi.update(tweet.id, data)
            : await tweetApi.update(tweet.id, data);

      if (!updatedTweet) return false;

      window.dispatchEvent(
        new CustomEvent("tweet-updated", {
          detail: { tweet: updatedTweet },
        }),
      );

      return updatedTweet;
    } catch (error) {
      console.error("Failed to update tweet", error);
      throw error;
    }
  };

  const like = useTweetLike(tweet);
  const repost = useTweetRepost(tweet);
  const bookmark = useTweetBookmark(tweet);

  const rootPostId = tweet.isComment ? tweet.postId : tweet.id;

  const comments = useTweetComments({
    postId: rootPostId ?? tweet.id,
    parentCommentId: tweet.isComment ? tweet.id : null,
    initialCount: tweet.repliesCount,
    initiallyOpen: commentsInitiallyOpen,
  });

  const openCommentModal = (comment: Tweet | null = null) => {
    setCommentModalTarget(comment);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentModalTarget(null);
  };

  const clickOrDragHandlers = useClickOrDrag(() => {
    if (!navigateToPost || isCommentModalOpen) return;

    navigate(
      tweet.isComment
        ? APP_ROUTES.comment(tweet.id)
        : APP_ROUTES.post(tweet.id),
    );
  });

  return (
    <>
      <article
        {...(navigateToPost ? clickOrDragHandlers : {})}
        className={cn(
          "grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border px-4 py-3 transition-colors",
          navigateToPost && "cursor-pointer hover:bg-muted/40",
          className,
        )}
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
            // replyToUsername={tweet.replyToUsername} якщо десь знадобиться "У відповідь @dev_user"
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
            onComment={() => openCommentModal(tweet)}
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
          onSubmit={async (data) => {
            return comments.createComment(data, null);
          }}
          onDelete={comments.deleteComment}
          onUpdate={comments.updateComment}
          onOpenReplyModal={openCommentModal}
        />
      )}

      <EditModal
        open={isEditModalOpen}
        title={tweet.isComment ? "Редагувати коментар" : "Редагувати пост"}
        initialContent={tweet.content}
        initialMedia={mapMediaToComposerMedia(tweet.attachments)}
        initialPoll={mapPollToComposerPoll(tweet.poll)}
        initialLocation={tweet.location}
        initialEmbed={tweet.embed}
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
