import { useTweetComposer } from "@/hooks/composer";

import { Composer } from "@/components/composer";
import { TweetCard } from "@/components/tweet";

import type { Tweet, ComposerSubmitData } from "@/types";

interface TweetCommentsProps {
  comments: Tweet[];

  isLoading: boolean;
  isSubmitting: boolean;

  error?: string | null;

  replyingToUsername: string;

  onSubmit: (
    data: ComposerSubmitData,
    parentCommentId?: string | null,
  ) => Promise<boolean>;

  onDelete: (commentId: string) => Promise<void>;

  onUpdate: (
    commentId: string,
    data: ComposerSubmitData | string,
  ) => Promise<Tweet | false>;

  onOpenReplyModal: (comment: Tweet) => void;
}

export default function TweetComments({
  comments,
  isLoading,
  error,
  replyingToUsername,
  onSubmit,
  onDelete,
  onUpdate,
}: TweetCommentsProps) {

  const composer = useTweetComposer({
    onSubmit: async (data) => {
      return onSubmit(data, null);
    },
  });

  return (
    <>
      <section className="border-b border-border">
        <div className="px-4 py-3">
          <Composer
            composer={composer}
            placeholder="Post your reply"
            submitLabel="Reply"
            showAvatar
            variant="comment"
            replyingToUsername={replyingToUsername}
          />

          {error && (
            <p className="my-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Comments */}
      {isLoading ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Завантаження коментарів...
        </p>
      ) : comments.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Поки що немає коментарів. Будьте першим.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((reply) => (
            <TweetCard
              key={reply.id}
              tweet={reply}
              variant="feed"
              navigateToPost
              onDeleteComment={onDelete}
              onUpdateComment={onUpdate}
            />
          ))}
        </div>
      )}
    </>
  );
}
