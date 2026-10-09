import type { AppStore } from "@/store/index";
import { postsApi, reactionKey, type Reaction } from "@/store/postsApi";

export async function runReaction(
  store: AppStore,
  arg: Reaction,
): Promise<boolean> {
  const fixedCacheKey = reactionKey(arg);
  if (
    postsApi.endpoints.react.select(fixedCacheKey)(store.getState()).isLoading
  )
    return false;
  if (
    arg.action === "vote" &&
    (arg.poll.votedOptionId ||
      arg.poll.isClosed ||
      (arg.poll.expiresAt !== null &&
        Date.parse(arg.poll.expiresAt) <= Date.now()))
  )
    return false;
  try {
    await store
      .dispatch(postsApi.endpoints.react.initiate(arg, { fixedCacheKey }))
      .unwrap();
    return true;
  } catch {
    return false;
  }
}
