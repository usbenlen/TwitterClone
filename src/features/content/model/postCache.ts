import { pollsMatch } from "@/features/content/lib/posts/poll";
import { updatePostAuthors } from "@/features/content/lib/posts/updatePostAuthors";
import {
  entityTag,
  listId,
  listTag,
  matches,
  targetKey,
  targetOf,
} from "@/features/content/model/postTargets";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";

import type { AppDispatch, RootState } from "@/app/store/store";
import type { postsApi as PostsApi } from "@/features/content/api/postQueries";
import type { Post, PostPoll, Target } from "@/features/content/types";
import type { User } from "@/features/profiles/types";

type PostsCacheApi = Pick<typeof PostsApi, "util" | "endpoints">;

function visit(posts: Post[], update: (post: Post) => void) {
  posts.forEach((post) => {
    update(post);
    if (post.ancestors) visit(post.ancestors, update);
  });
}

export function patchPosts(
  postsApi: PostsCacheApi,
  dispatch: AppDispatch,
  state: RootState,
  update: (post: Post) => void,
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

  for (const limit of postsApi.util.selectCachedArgsForQuery(
    state,
    "getRecommendedPosts",
  )) {
    patches.push(
      dispatch(
        postsApi.util.updateQueryData("getRecommendedPosts", limit, (draft) => {
          draft.pages.forEach((page) => visit(page.items, update));
        }),
      ),
    );
  }

  return patches;
}

/** Update vote state without applying post edits to versioned quote snapshots. */
export function patchPoll(
  postsApi: PostsCacheApi,
  dispatch: AppDispatch,
  state: RootState,
  target: Target,
  expected: PostPoll,
  poll: PostPoll,
) {
  patchPosts(postsApi, dispatch, state, (post) => {
    if (
      matches(post, target) &&
      post.poll &&
      pollsMatch(post.poll, expected)
    ) {
      post.poll = poll;
    }
    const quote = post.quote;
    if (
      quote?.targetId === target.id &&
      quote.targetType === target.type &&
      quote.target?.poll &&
      pollsMatch(quote.target.poll, expected) &&
      pollsMatch(poll, expected)
    ) {
      quote.target.poll = poll;
    }
  });
}

export function updateCachedProfileAuthors(
  postsApi: PostsCacheApi,
  user: User,
  dispatch: AppDispatch,
  state: RootState,
) {
  for (const limit of postsApi.util.selectCachedArgsForQuery(
    state,
    "getRecommendedPosts",
  )) {
    dispatch(
      postsApi.util.updateQueryData("getRecommendedPosts", limit, (draft) => {
        draft.pages.forEach((page) => updatePostAuthors(page.items, user));
      }),
    );
  }
  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    dispatch(
      postsApi.util.updateQueryData("getPosts", arg, (draft) => {
        updatePostAuthors(draft, user);
      }),
    );
  }

  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    dispatch(
      postsApi.util.updateQueryData("getThread", id, (draft) => {
        updatePostAuthors(
          [draft.target, ...draft.ancestors, ...draft.replies],
          user,
        );
      }),
    );
  }
}

export function publishPosts(
  postsApi: PostsCacheApi,
  posts: Post[],
  dispatch: AppDispatch,
  state: RootState,
) {
  if (MOCK_ENABLED) posts = structuredClone(posts);

  const tags = [listTag("feed"), listTag("search"), listTag("recommended")];

  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts")) {
    if (arg.kind !== "feed" && !(arg.kind === "profile" && arg.tab === "posts"))
      continue;

    dispatch(
      postsApi.util.updateQueryData("getPosts", arg, (draft) => {
        for (const post of [...posts].reverse()) {
          if (arg.kind === "profile" && arg.username !== post.author.username)
            continue;

          if (!draft.some((item) => matches(item, targetOf(post))))
            draft.unshift(post);
        }
      }),
    );
  }

  posts.forEach((post) =>
    tags.push(listTag(`profile:${post.author.username}:posts`)),
  );

  dispatch(postsApi.util.invalidateTags(tags));
}

export function removeCachedPost(
  postsApi: PostsCacheApi,
  target: Target,
  dispatch: AppDispatch,
  state: RootState,
) {
  const removed = new Set([targetKey(target)]);

  const all: Post[] = [];

  for (const limit of postsApi.util.selectCachedArgsForQuery(
    state,
    "getRecommendedPosts",
  )) {
    const data = postsApi.endpoints.getRecommendedPosts.select(limit)(state).data;
    if (data) all.push(...data.pages.flatMap((page) => page.items));
  }

  for (const arg of postsApi.util.selectCachedArgsForQuery(state, "getPosts"))
    all.push(...(postsApi.endpoints.getPosts.select(arg)(state).data ?? []));

  for (const id of postsApi.util.selectCachedArgsForQuery(state, "getThread")) {
    const data = postsApi.endpoints.getThread.select(id)(state).data;
    if (data) all.push(data.target, ...data.ancestors, ...data.replies);
  }

  let size: number;

  do {
    size = removed.size;

    all.forEach((post) => {
      if (
        post.isComment &&
        ((target.type === "post" && post.postId === target.id) ||
          (post.parentCommentId &&
            removed.has(`comment:${post.parentCommentId}`)))
      )
        removed.add(targetKey(targetOf(post)));
    });
  } while (size !== removed.size);

  const keep = (post: Post) => !removed.has(targetKey(targetOf(post)));

  const affectedLists = postsApi.util
    .selectCachedArgsForQuery(state, "getPosts")
    .filter((arg) =>
      postsApi.endpoints.getPosts
        .select(arg)(state)
        .data?.some((post) => !keep(post)),
    )
    .map((arg) => listTag(listId(arg)));

  patchPosts(postsApi, dispatch, state, (post) => {
    if (post.quote && removed.has(`${post.quote.targetType}:${post.quote.targetId}`))
      post.quote.target = null;

    if (post.ancestors) post.ancestors = post.ancestors.filter(keep);
  });

  for (const limit of postsApi.util.selectCachedArgsForQuery(
    state,
    "getRecommendedPosts",
  )) {
    dispatch(
      postsApi.util.updateQueryData("getRecommendedPosts", limit, (draft) => {
        draft.pages.forEach((page) => {
          page.items = page.items.filter(keep);
        });
      }),
    );
  }

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
    .filter((post) => !keep(post))
    .forEach((post) => {
      if (post.postId)
        tags.push(entityTag({ type: "post", id: post.postId }));

      if (post.parentCommentId)
        tags.push(entityTag({ type: "comment", id: post.parentCommentId }));
    });

  dispatch(postsApi.util.invalidateTags([...tags, ...affectedLists]));
}
