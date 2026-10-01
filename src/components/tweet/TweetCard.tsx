import { memo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Repeat2 } from "lucide-react";

import {
  targetOf,
  useDeletePostMutation,
  useUpdatePostMutation,
} from "@/store/postsApi";

import {
  useAuth,
  useTweetLike,
  useTweetRepost,
  useTweetBookmark,
  useTweetComments,
  useClickOrDrag,
} from "@/hooks";

import {
  EditHistoryModal,
  EditModal,
  QuoteModal,
  CommentModal,
} from "@/components/modal/index";

import { Avatar } from "@/ui";

import {
  TweetHeader,
  TweetActions,
  TweetComments,
  TweetContent,
} from "@/components/tweet";

import { APP_ROUTES } from "@/constants/routes";
import {
  mapMediaToComposerMedia,
  mapPollToComposerPoll,
  cn,
} from "@/utils";

import type { Tweet, ComposerSubmitData, User } from "@/types";

interface TweetCardProps {
  tweet: Tweet;
  navigateToPost?: boolean;
  commentsInitiallyOpen?: boolean;
  className?: string;
  variant?: "feed" | "post";
  repostedBy?: Pick<User, "username" | "displayName">;
  onOpenReplyModal?: (comment: Tweet) => void;
  onDelete?: (tweetId: string) => Promise<void>;
  onUpdate?: (
    tweetId: string,
    data: ComposerSubmitData,
  ) => Promise<boolean | Tweet>;
}

function TweetCard({
  tweet,
  navigateToPost = true,
  commentsInitiallyOpen = false,
  className,
  variant = "feed",
  repostedBy,
  onOpenReplyModal,
  onDelete,
  onUpdate,
}: TweetCardProps) {
  const navigate = useNavigate();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const { user } = useAuth();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentModalTarget, setCommentModalTarget] = useState<Tweet | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false);

  const isOwnTweet = user?.id === tweet.author.id;

  const handleDelete = async () => {
    try {
      if (onDelete) await onDelete(tweet.id);
      else await deletePost(targetOf(tweet)).unwrap();

      if (variant === "post") navigate(APP_ROUTES.HOME);
    } catch (error) {
      console.error("Failed to delete tweet", error);
    }
  };

  const handleUpdate = async (data: ComposerSubmitData) => {
    try {
      const result = onUpdate
        ? await onUpdate(tweet.id, data)
        : await updatePost({ ...targetOf(tweet), data }).unwrap();

      if (result === false) throw new Error("Не вдалося оновити матеріал.");
      const updatedTweet = result === true ? { ...tweet, ...data } : result;

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

  const handleOpenReplyModal = () => {
    if (onOpenReplyModal) {
      onOpenReplyModal(tweet);
      return;
    }

    openCommentModal(tweet);
  };

  const clickOrDragHandlers = useClickOrDrag(() => {
    if (!navigateToPost || isCommentModalOpen || isQuoteModalOpen) return;

    navigate(APP_ROUTES.post(tweet.id));
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
        {repostedBy && (
          <>
            <div className="flex justify-end pb-1 text-muted-foreground">
              <Repeat2 size={16} aria-hidden="true" />
            </div>

            <div className="min-w-0 pb-1 text-xs font-semibold text-muted-foreground">
              <Link
                to={APP_ROUTES.profile(repostedBy.username)}
                className="hover:underline"
              >
                {repostedBy.displayName || `@${repostedBy.username}`} reposted
              </Link>
            </div>
          </>
        )}

        <div className="flex justify-center">
          <Avatar
            userId={tweet.author.id}
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
            onOpenEditHistory={
              variant === "post" && !navigateToPost && tweet.updatedAt
                ? () => setIsEditHistoryOpen(true)
                : undefined
            }
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
            onComment={handleOpenReplyModal}
            onRepost={repost.toggleRepost}
            onQuote={() => setIsQuoteModalOpen(true)}
            repostPending={repost.pending}
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
          parentCommentId={tweet.isComment ? tweet.id : null}
          threadAuthorId={tweet.author.id}
          onSubmit={comments.createComment}
          onDelete={comments.deleteComment}
          onUpdate={comments.updateComment}
          onOpenReplyModal={openCommentModal}
        />
      )}

      <EditModal
        open={isEditModalOpen}
        title="Редагувати пост"
        initialContent={tweet.content}
        initialMedia={mapMediaToComposerMedia(tweet.attachments)}
        initialPoll={mapPollToComposerPoll(tweet.poll)}
        initialLocation={tweet.location}
        initialLinkPreview={tweet.linkPreview}
        initialQuote={tweet.quote}
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

      <QuoteModal
        open={isQuoteModalOpen}
        tweet={tweet}
        repostedByMe={repost.repostedByMe}
        onEnsureRepost={repost.ensureReposted}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      <EditHistoryModal
        open={isEditHistoryOpen}
        tweet={tweet}
        onClose={() => setIsEditHistoryOpen(false)}
      />
    </>
  );
}

export default memo(TweetCard);
