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

import { useTweetLike } from "@/hooks/useTweetLike";
import { useTweetRepost } from "@/hooks/useTweetRepost";
import { useTweetComments } from "@/hooks/useTweetComments";
import { APP_ROUTES } from "@/constants/routes";

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
  const like = useTweetLike(tweet);
  const repost = useTweetRepost(tweet);
  const comments = useTweetComments(
    tweet.id,
    tweet.repliesCount,
    commentsInitiallyOpen,
  );

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!navigateToPost) return;

    const target = event.target as HTMLElement;

    if (target.closest("button, a, textarea, input, video")) return;

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
          onComment={() => {
            void comments.toggleOpen();
          }}
          onRepost={repost.toggleRepost}
          onLike={like.toggleLike}
        />

        {comments.open && (
          <TweetComments
            comments={comments.comments}
            isLoading={comments.isLoading}
            isSubmitting={comments.isSubmitting}
            error={comments.error}
            onSubmit={comments.createComment}
            onDelete={comments.deleteComment}
          />
        )}
      </div>
    </article>
  );
}
