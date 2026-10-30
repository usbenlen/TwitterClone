import { memo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Repeat2 } from "lucide-react";

import { targetOf } from "@/store/posts/postTargets";
import {
  useDeletePostMutation,
  useUpdatePostMutation,
} from "@/store/posts/postQueries";

import { useAuth } from "@/hooks/auth/useAuth";
import {
  usePostLike,
  usePostRepost,
  usePostBookmark,
  usePostComments,
} from "@/hooks/posts";

import { useClickOrDrag } from "@/hooks/useClickOrDrag";

import EditHistoryModal from "@/components/posts/EditHistoryModal";
import { EditPostModal, QuoteModal, CommentModal } from "@/components/composer";

import { Avatar } from "@/components/ui/Avatar";
import ReportModal from "@/components/reports/ReportModal";

import { PostHeader, PostActions, PostComments, PostContent } from "@/components/posts";

import { APP_ROUTES } from "@/constants/routes";
import {
  mapMediaToComposerMedia,
  mapPollToComposerPoll,
} from "@/utils/composer/composerMappers";
import { cn } from "@/utils/cn";
import { getReplyToUsername } from "@/utils/posts/ancestors";
import { normalizeInlineDisplayText } from "@/utils/displayText";

import type { Post, ComposerSubmitData, User } from "@/types";

interface PostCardProps {
  post: Post;
  navigateToPost?: boolean;
  commentsInitiallyOpen?: boolean;
  className?: string;
  variant?: "feed" | "post";
  repostedBy?: Pick<User, "username" | "displayName">;
  showReplyContext?: boolean;
  onOpenReplyModal?: (comment: Post) => void;
  onDelete?: (postId: string) => Promise<void>;
  onUpdate?: (
    postId: string,
    data: ComposerSubmitData,
  ) => Promise<boolean | Post>;
}

function PostCard({
  post,
  navigateToPost = true,
  commentsInitiallyOpen = false,
  className,
  variant = "feed",
  repostedBy,
  showReplyContext = false,
  onOpenReplyModal,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const navigate = useNavigate();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const { user } = useAuth();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentModalTarget, setCommentModalTarget] = useState<Post | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const isOwnPost = user?.id === post.author.id;
  const showReply = showReplyContext && post.isComment;
  const replyToUsername = showReply ? getReplyToUsername(post) : null;
  const replyToFallbackHref = showReply && !replyToUsername
    ? APP_ROUTES.post(post.parentCommentId ?? post.postId ?? post.id)
    : undefined;

  const handleDelete = async () => {
    try {
      if (onDelete) await onDelete(post.id);
      else await deletePost(targetOf(post)).unwrap();

      if (variant === "post") navigate(APP_ROUTES.HOME);
    } catch (error) {
      console.error("Failed to delete tweet", error);
    }
  };

  const handleUpdate = async (data: ComposerSubmitData) => {
    try {
      const result = onUpdate
        ? await onUpdate(post.id, data)
        : await updatePost({ ...targetOf(post), data }).unwrap();

      if (result === false) throw new Error("Не вдалося оновити матеріал.");
      const updatedPost = result === true ? { ...post, ...data } : result;

      return updatedPost;
    } catch (error) {
      console.error("Failed to update tweet", error);
      throw error;
    }
  };

  const like = usePostLike(post);
  const repost = usePostRepost(post);
  const bookmark = usePostBookmark(post);

  const rootPostId = post.isComment ? post.postId : post.id;

  const comments = usePostComments({
    postId: rootPostId ?? post.id,
    parentCommentId: post.isComment ? post.id : null,
    initialCount: post.repliesCount,
    initiallyOpen: commentsInitiallyOpen,
  });

  const openCommentModal = (comment: Post | null = null) => {
    setCommentModalTarget(comment);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentModalTarget(null);
  };

  const handleOpenReplyModal = () => {
    if (onOpenReplyModal) {
      onOpenReplyModal(post);
      return;
    }

    openCommentModal(post);
  };

  const clickOrDragHandlers = useClickOrDrag(() => {
    if (!navigateToPost || isCommentModalOpen || isQuoteModalOpen) return;

    navigate(APP_ROUTES.post(post.id));
  });

  return (
    <>
      <article
        {...(navigateToPost ? clickOrDragHandlers : {})}
        className={cn(
          "grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border px-4 py-3 transition-colors",
          navigateToPost && "cursor-pointer hover:bg-muted/40 dark:hover:bg-row-hover dark:active:bg-muted",
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
                className="inline-block max-w-full overflow-hidden align-bottom wrap-anywhere hover:underline"
              >
                {normalizeInlineDisplayText(
                  repostedBy.displayName || `@${repostedBy.username}`,
                )} reposted
              </Link>
            </div>
          </>
        )}

        <div className="flex justify-center">
          <Avatar
            userId={post.author.id}
            name={post.author.displayName}
            fallbackName={post.author.username}
            src={post.author.avatarUrl}
            className="size-11 shrink-0"
          />
        </div>

        <div className="min-w-0">
          <PostHeader
            onReport={
              user && !isOwnPost ? () => setIsReportOpen(true) : undefined
            }
            author={post.author}
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            replyToUsername={replyToUsername}
            replyToLabel="Replying to"
            replyToFallbackHref={replyToFallbackHref}
            onDelete={isOwnPost ? handleDelete : undefined}
            onEdit={isOwnPost ? () => setIsEditModalOpen(true) : undefined}
            onOpenEditHistory={
              variant === "post" && !navigateToPost && post.updatedAt
                ? () => setIsEditHistoryOpen(true)
                : undefined
            }
          />

          <PostContent post={post} />

          <PostActions
            likedByMe={like.likedByMe}
            likesCount={like.likesCount}
            repostedByMe={repost.repostedByMe}
            repliesCount={comments.commentsCount}
            retweetsCount={repost.repostsCount}
            viewsCount={post.viewsCount}
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
        <PostComments
          comments={comments.comments}
          isLoading={comments.isLoading}
          isSubmitting={comments.isSubmitting}
          error={comments.error}
          replyingToUsername={post.author.username}
          parentCommentId={post.isComment ? post.id : null}
          threadAuthorId={post.author.id}
          onSubmit={comments.createComment}
          onDelete={comments.deleteComment}
          onUpdate={comments.updateComment}
          onOpenReplyModal={openCommentModal}
        />
      )}

      <EditPostModal
        open={isEditModalOpen}
        title="Редагувати пост"
        initialContent={post.content}
        initialMedia={mapMediaToComposerMedia(post.attachments)}
        initialPoll={mapPollToComposerPoll(post.poll)}
        initialLocation={post.location}
        initialLinkPreview={post.linkPreview}
        initialQuote={post.quote}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
      />

      <CommentModal
        open={isCommentModalOpen}
        post={post}
        replyTo={commentModalTarget}
        onClose={closeCommentModal}
        onSubmit={comments.createComment}
        isSubmitting={comments.isSubmitting}
      />

      <QuoteModal
        open={isQuoteModalOpen}
        post={post}
        repostedByMe={repost.repostedByMe}
        onEnsureRepost={repost.ensureReposted}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      <EditHistoryModal
        open={isEditHistoryOpen}
        post={post}
        onClose={() => setIsEditHistoryOpen(false)}
      />
      {isReportOpen && (
        <ReportModal
          targetType={post.isComment ? "comments" : "posts"}
          targetId={post.id}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </>
  );
}

export default memo(PostCard);
