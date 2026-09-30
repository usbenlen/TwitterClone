import { useAppSelector, useAppStore } from "@/store/hooks";
import { postsApi, reactionKey } from "@/store/postsApi";
import { runReaction } from "@/store/reactions";
import type { TweetPoll } from "@/types/poll";

export function usePollVote(
  tweetId: string,
  poll: TweetPoll,
  isComment = false,
) {
  const store = useAppStore();
  const target = {
    id: tweetId,
    type: isComment ? ("comment" as const) : ("post" as const),
  };
  const loading = useAppSelector(
    (state) =>
      postsApi.endpoints.react.select(
        reactionKey({ ...target, action: "vote" }),
      )(state).isLoading,
  );
  return {
    poll,
    loading,
    vote: (optionId: string) =>
      runReaction(store, { ...target, action: "vote", optionId, poll }),
  };
}
