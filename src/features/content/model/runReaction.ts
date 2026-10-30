import { postsApi } from "@/features/content/api/postQueries";
import { canVoteInPoll, pollsMatch } from "@/features/content/lib/posts/poll";
import { reactionKey } from "@/features/content/model/postTargets";

import type { AppStore } from "@/app/store/store";
import type { Reaction } from "@/features/content/types";

export async function runReaction(
  store: AppStore,
  arg: Reaction,
): Promise<boolean> {
  const fixedCacheKey = reactionKey(arg);
  if (postsApi.endpoints.react.select(fixedCacheKey)(store.getState()).isLoading)
    return false;

  if (arg.action === "vote") {
    if (!canVoteInPoll(arg.poll, arg.optionId)) return false;

    const latest = postsApi.endpoints.getPollState.select({
      type: arg.type,
      id: arg.id,
    })(store.getState()).data;

    if (latest !== undefined) {
      if (!latest || !pollsMatch(arg.poll, latest)) return false;
      arg = { ...arg, poll: latest };
    }

    if (!canVoteInPoll(arg.poll, arg.optionId)) return false;
  }
  try {
    await store
      .dispatch(postsApi.endpoints.react.initiate(arg, { fixedCacheKey }))
      .unwrap();

    return true;
  } catch {
    return false;
  }
}
