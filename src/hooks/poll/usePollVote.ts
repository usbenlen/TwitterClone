import { useAppSelector, useAppStore } from "@/store/hooks";
import { postsApi, reactionKey } from "@/store/postsApi";
import { runReaction } from "@/store/reactions";
import { pollsMatch } from "@/utils/poll";

import type { TweetPoll } from "@/types/poll";

export function usePollVote(
  tweetId: string,
  poll: TweetPoll,
  isComment = false,
  readOnly = false,
) {
  const store = useAppStore();
  const target = {
    id: tweetId,
    type: isComment ? ("comment" as const) : ("post" as const),
  };
  const loading = useAppSelector(
    (state) =>
      !readOnly &&
      postsApi.endpoints.react.select(
        reactionKey({ ...target, action: "vote" }),
      )(state).isLoading,
  );
  const sharedPoll = useAppSelector((state) =>
    readOnly
      ? undefined
      : postsApi.endpoints.getPollState.select(target)(state).data,
  );
  const currentPoll = sharedPoll && pollsMatch(poll, sharedPoll) ? sharedPoll : poll;

  return {
    poll: currentPoll,
    loading,
    vote: (optionId: string) =>
      runReaction(store, {
        ...target,
        action: "vote",
        optionId,
        poll: currentPoll,
      }),
  };
}
