import { useAppSelector, useAppStore } from "@/store/hooks";
import { postsApi } from "@/store/posts/postQueries";
import { reactionKey } from "@/store/posts/postTargets";
import { runReaction } from "@/store/posts/runReaction";

import { pollsMatch } from "@/utils/posts/poll";

import type { PostPoll } from "@/types/poll";

export function usePollVote(
  postId: string,
  poll: PostPoll,
  isComment = false,
  readOnly = false,
) {
  const store = useAppStore();
  const target = {
    id: postId,
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
