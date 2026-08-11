/** @format */

import { useNavigate } from "react-router";

import {
  TweetHeader,
  TweetActions,
  TweetMedia,
} from "@/components/tweet";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import TweetLocation from "@/components/tweet/location/TweetLocation";
import TweetEmbed from "@/components/tweet/embed/TweetEmbed";
import TweetComments from "@/components/tweet/TweetComments";

import { Avatar } from "@/ui";

import type { Tweet } from "@/types/tweet";

import { useState } from "react";
import { useTweetLike } from "@/hooks/useTweetLike";
import { useTweetRepost } from "@/hooks/useTweetRepost";
import { useTweetBookmark } from "@/hooks/useTweetBookmark";
import { useTweetComments } from "@/hooks/useTweetComments";
import { APP_ROUTES } from "@/constants/routes";
import { CommentModal } from "@/components/modal";

interface TweetCardProps {
  tweet: Tweet;
  navigateToPost?: boolean;
  commentsInitiallyOpen?: boolean;
}

export default function TweetCard({
  tweet,
  navigateToPost = true,
  commentsInitiallyOpen = false,
}: TweetCardProps) {
  const navigate = useNavigate();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const like = useTweetLike(tweet);
  const repost = useTweetRepost(tweet);
  const bookmark = useTweetBookmark(tweet);
  const comments = useTweetComments(
    tweet.id,
    tweet.repliesCount,
    commentsInitiallyOpen || !navigateToPost,
  );

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!navigateToPost) return;

    const target = event.target as HTMLElement;

    if (
      target.closest(
        'button, a, textarea, input, video, [data-tweet-interactive="true"]',
      )
    ) {
      return;
    }

    navigate(APP_ROUTES.post(tweet.id));
  };

  return (
    <article
      onClick={handleCardClick}
      className={`grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border p-5 transition-colors ${
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
          content={tweet.content}
        />

        {tweet.location && <TweetLocation location={tweet.location} />}

        {tweet.embed && <TweetEmbed embed={tweet.embed} />}

        {tweet.poll && <TweetPoll tweetId={tweet.id} poll={tweet.poll} />}

        <TweetMedia attachments={tweet.attachments} />

        <TweetActions
          likedByMe={like.likedByMe}
          likesCount={like.likesCount}
          repostedByMe={repost.repostedByMe}
          repliesCount={comments.commentsCount}
          retweetsCount={repost.repostsCount}
          viewsCount={tweet.viewsCount}
          bookmarkedByMe={bookmark.bookmarkedByMe}
          onComment={() => {
            setIsCommentModalOpen(true);
          }}
          onRepost={repost.toggleRepost}
          onLike={like.toggleLike}
          onBookmark={bookmark.toggleBookmark}
        />

        {!navigateToPost && comments.open && (
          <TweetComments
            comments={comments.comments}
            isLoading={comments.isLoading}
            isSubmitting={comments.isSubmitting}
            error={comments.error}
            onSubmit={comments.createComment}
            onDelete={comments.deleteComment}
          />
        )}

        <CommentModal
          open={isCommentModalOpen}
          tweet={tweet}
          onClose={() => setIsCommentModalOpen(false)}
          onSubmit={comments.createComment}
          isSubmitting={comments.isSubmitting}
        />
      </div>
    </article>
  );
}
