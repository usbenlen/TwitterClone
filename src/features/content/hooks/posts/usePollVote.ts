import { postsApi } from "@/features/content/api/postQueries";
import { pollsMatch } from "@/features/content/lib/posts/poll";
import { reactionKey } from "@/features/content/model/postTargets";
import { runReaction } from "@/features/content/model/runReaction";
import { useAppSelector, useAppStore } from "@/shared/store/hooks";

import type { PostPoll } from "@/features/content/types";

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
