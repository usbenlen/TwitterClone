import { MOCK_ENABLED } from "@/mock/config";
import { updateTweetAuthors } from "@/utils/updateTweetAuthors";
import type { Tweet, User } from "@/types";
import type { AppDispatch, RootState } from "@/store";
import type { postsApi as PostsApi } from "@/store/postsApi";
import {
  targetKey,
  targetOf,
  matches,
  listTag,
  listId,
  entityTag,
  type Target,
} from "@/store/posts/types";
type PostsCacheApi = Pick<typeof PostsApi, "util" | "endpoints">;

function visit(tweets: Tweet[], update: (tweet: Tweet) => void) {
  tweets.forEach((tweet) => {
    update(tweet);
    if (tweet.ancestors) visit(tweet.ancestors, update);
  });
}
export function patchTweets(
  postsApi: PostsCacheApi,
  dispatch: AppDispatch,
  state: RootState,
  update: (tweet: Tweet) => void,
) {
  const patches = postsApi.util
    .selectCachedArgsForQuery(state, "getPosts")
    .map((arg) =>
      dispatch(
        postsApi.util.updateQueryData("getPosts", arg, (draft) => {
          visit(draft, update);
        }),
      ),
    );
  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    patches.push(
      dispatch(
        postsApi.util.updateQueryData("getThread", id, (draft) => {
          visit([draft.target, ...draft.ancestors, ...draft.replies], update);
        }),
      ),
    );
  }
  return patches;
}

export function updateCachedProfileAuthors(
  postsApi: PostsCacheApi,
  user: User,
  dispatch: AppDispatch,
  state: RootState,
) {
  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    dispatch(
      postsApi.util.updateQueryData("getPosts", arg, (draft) => {
        updateTweetAuthors(draft, user);
      }),
    );
  }
  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    dispatch(
      postsApi.util.updateQueryData("getThread", id, (draft) => {
        updateTweetAuthors(
          [draft.target, ...draft.ancestors, ...draft.replies],
          user,
        );
      }),
    );
  }
}

export function publishPosts(
  postsApi: PostsCacheApi,
  tweets: Tweet[],
  dispatch: AppDispatch,
  state: RootState,
) {
  if (MOCK_ENABLED) tweets = structuredClone(tweets);
  const tags = [listTag("feed"), listTag("search")];
  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    if (arg.kind !== "feed" && !(arg.kind === "profile" && arg.tab === "posts"))
      continue;
    dispatch(
      postsApi.util.updateQueryData("getPosts", arg, (draft) => {
        for (const tweet of [...tweets].reverse()) {
          if (arg.kind === "profile" && arg.username !== tweet.author.username)
            continue;
          if (!draft.some((item) => matches(item, targetOf(tweet))))
            draft.unshift(tweet);
        }
      }),
    );
  }
  tweets.forEach((tweet) =>
    tags.push(listTag(`profile:${tweet.author.username}:posts`)),
  );
  dispatch(postsApi.util.invalidateTags(tags));
}

export function removeCachedTweet(
  postsApi: PostsCacheApi,
  target: Target,
  dispatch: AppDispatch,
  state: RootState,
) {
  const removed = new Set([targetKey(target)]);

  const all: Tweet[] = [];
  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    all.push(...(postsApi.endpoints.getPosts.select(arg)(state).data ?? []));
  }
  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    const data = postsApi.endpoints.getThread.select(id)(state).data;
    if (data) all.push(data.target, ...data.ancestors, ...data.replies);
  }
  let size: number;
  do {
    size = removed.size;
    all.forEach((tweet) => {
      if (
        tweet.isComment &&
        ((target.type === "post" && tweet.postId === target.id) ||
          (tweet.parentCommentId &&
            removed.has(`comment:${tweet.parentCommentId}`)))
      )
        removed.add(targetKey(targetOf(tweet)));
    });
  } while (size !== removed.size);
  const keep = (tweet: Tweet) => !removed.has(targetKey(targetOf(tweet)));
  const affectedLists = postsApi.util
    .selectCachedArgsForQuery(state, "getPosts")
    .filter((arg) =>
      postsApi.endpoints.getPosts
        .select(arg)(state)
        .data?.some((tweet) => !keep(tweet)),
    )
    .map((arg) => listTag(listId(arg)));
  patchTweets(postsApi, dispatch, state, (tweet) => {
    if (
      tweet.quote &&
      removed.has(`${tweet.quote.targetType}:${tweet.quote.targetId}`)
    )
      tweet.quote.target = null;
    if (tweet.ancestors) tweet.ancestors = tweet.ancestors.filter(keep);
  });
  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    dispatch(
      postsApi.util.updateQueryData("getPosts", arg, (draft) =>
        draft.filter(keep),
      ),
    );
  }
  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    dispatch(
      postsApi.util.updateQueryData("getThread", id, (draft) => {
        draft.replies = draft.replies.filter(keep);
        draft.ancestors = draft.ancestors.filter(keep);
      }),
    );
  }

  const tags = [...removed].map((id) => ({ type: "Post" as const, id }));
  all
    .filter((tweet) => !keep(tweet))
    .forEach((tweet) => {
      if (tweet.postId)
        tags.push(entityTag({ type: "post", id: tweet.postId }));
      if (tweet.parentCommentId)
        tags.push(entityTag({ type: "comment", id: tweet.parentCommentId }));
    });
  dispatch(postsApi.util.invalidateTags([...tags, ...affectedLists]));
}
