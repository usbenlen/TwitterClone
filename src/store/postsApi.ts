import { current } from "@reduxjs/toolkit";
import { tweetApi, commentApi, userApi, searchApi, pollApi } from "@/api";
import { MOCK_ENABLED } from "@/mock/config";
import { appApi, request } from "@/store/api";
import { updateTweetAuthors } from "@/utils/updateTweetAuthors";
import type {
  User,
  UserShort,
  Tweet,
  TweetBase,
  ThreadResponse,
  EditHistoryResponse,
  CreateTweetRequest,
  CreateCommentRequest,
  UpdateTweetRequest,
  SearchCriteria,
  SearchViewerContext,
} from "@/types";
import type { AppDispatch, RootState } from "./index";
import { sessionGeneration } from "./session";

export { errorMessage } from "@/store/api";

export type ProfileTab = "posts" | "replies" | "likes" | "reposts";
export type PostsQuery =
  | { kind: "feed" | "bookmarks" }
  | { kind: "comments"; postId: string }
  | { kind: "profile"; username: string; tab: ProfileTab }
  | { kind: "search"; criteria: SearchCriteria; viewer: SearchViewerContext };

export interface Target {
  id: string;
  type: "post" | "comment";
}

export const targetOf = (tweet: Pick<Tweet, "id" | "isComment">): Target => ({
  id: tweet.id,
  type: tweet.isComment ? "comment" : "post",
});
export const targetKey = (target: Target) => `${target.type}:${target.id}`;
const matches = (tweet: TweetBase, target: Target) =>
  targetKey(targetOf(tweet)) === targetKey(target);
const entityTag = (target: Target) => ({
  type: "Post" as const,
  id: targetKey(target),
});
const listTag = (id: string) => ({ type: "List" as const, id });
const listId = (arg: PostsQuery) =>
  arg.kind === "profile"
    ? `profile:${arg.username}:${arg.tab}`
    : arg.kind === "comments"
      ? `comments:${arg.postId}`
      : arg.kind;

async function fetchPosts(arg: PostsQuery): Promise<Tweet[]> {
  switch (arg.kind) {
    case "feed":
      return tweetApi.getFeed();
    case "bookmarks": {
      const [posts, comments] = await Promise.all([
        tweetApi.getBookmarked(),
        commentApi.getBookmarked(),
      ]);
      return [...posts, ...comments].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    }
    case "comments":
      return commentApi.getByPostId(arg.postId);
    case "search":
      return searchApi.posts(arg.criteria, arg.viewer);
    case "profile": {
      const loaders = {
        posts: userApi.getPosts,
        replies: userApi.getReplies,
        likes: userApi.getLikes,
        reposts: userApi.getReposts,
      };
      return loaders[arg.tab](arg.username);
    }
  }
}

function tagsFor(tweets: Tweet[]): ReturnType<typeof entityTag>[] {
  return tweets.flatMap((tweet) => [
    entityTag(targetOf(tweet)),
    ...(tweet.quote
      ? [entityTag({ id: tweet.quote.targetId, type: tweet.quote.targetType })]
      : []),
    ...(tweet.ancestors ? tagsFor(tweet.ancestors) : []),
  ]);
}

export type Reaction = Target &
  (
    | { action: "like" | "repost" | "bookmark"; active: boolean }
    | { action: "vote"; optionId: string; poll: NonNullable<Tweet["poll"]> }
  );
export const reactionKey = (arg: Pick<Reaction, "type" | "id" | "action">) =>
  `${targetKey(arg)}:${arg.action}`;

async function sendReaction(arg: Reaction): Promise<Partial<Tweet>> {
  const api = arg.type === "comment" ? commentApi : tweetApi;
  switch (arg.action) {
    case "like":
      return api.toggleLike(arg.id, arg.active);
    case "repost": {
      const result = await api.toggleRepost(arg.id, arg.active);
      return {
        repostedByMe: result.repostedByMe,
        retweetsCount: result.repostsCount,
      };
    }
    case "bookmark": {
      const result = await api.toggleBookmark(arg.id, arg.active);
      const value =
        result && "isBookmarkedByCurrentUser" in result
          ? Boolean(result.isBookmarkedByCurrentUser)
          : result?.bookmarkedByMe;
      return { bookmarkedByMe: value ?? !arg.active };
    }
    case "vote":
      return { poll: await pollApi.vote(arg.id, arg.optionId) };
  }
}

export const postsApi = appApi.injectEndpoints({
  endpoints: (build) => ({
    getPosts: build.query<Tweet[], PostsQuery>({
      queryFn: (arg) => request(() => fetchPosts(arg)),
      providesTags: (data, _error, arg) => [
        listTag(listId(arg)),
        ...tagsFor(data ?? []),
      ],
    }),
    getSearchUsers: build.query<
      UserShort[],
      { criteria: SearchCriteria; viewer: SearchViewerContext }
    >({
      queryFn: ({ criteria, viewer }) =>
        request(() => searchApi.users(criteria, viewer)),
    }),
    getThread: build.query<ThreadResponse, string>({
      queryFn: (id) => request(() => commentApi.getThread(id)),
      providesTags: (data) =>
        data ? tagsFor([data.target, ...data.ancestors, ...data.replies]) : [],
    }),
    getHistory: build.query<EditHistoryResponse, Target>({
      queryFn: (arg) =>
        request(() =>
          (arg.type === "post" ? tweetApi : commentApi).getEditHistory(arg.id),
        ),
      providesTags: (_data, _error, arg) => [
        { type: "History", id: targetKey(arg) },
      ],
    }),
    createPost: build.mutation<Tweet, CreateTweetRequest>({
      queryFn: (arg) => request(() => tweetApi.create(arg)),
      async onQueryStarted(_arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation === sessionGeneration(lifecycle.getState())) {
            publishPosts(
              [data],
              lifecycle.dispatch,
              lifecycle.getState() as RootState,
            );
          }
        } catch {
          /* Mutation error is returned to the composer. */
        }
      },
    }),
    createComment: build.mutation<Tweet, CreateCommentRequest>({
      queryFn: (arg) => request(() => commentApi.create(arg)),
      invalidatesTags: (data, _error, arg) =>
        data
          ? [
              listTag(`comments:${arg.postId}`),
              entityTag({ type: "post", id: arg.postId }),
              ...(arg.parentCommentId
                ? [entityTag({ type: "comment", id: arg.parentCommentId })]
                : []),
              listTag(`profile:${data.author.username}:replies`),
            ]
          : [],
    }),
    updatePost: build.mutation<Tweet, Target & { data: UpdateTweetRequest }>({
      queryFn: (arg) =>
        request(() =>
          (arg.type === "post" ? tweetApi : commentApi).update(
            arg.id,
            arg.data,
          ),
        ),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchTweets(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (tweet) => {
              if (matches(tweet, arg)) Object.assign(tweet, data);
              if (
                tweet.quote?.targetId === arg.id &&
                tweet.quote.targetType === arg.type
              )
                tweet.quote.hasNewVersion = true;
            },
          );
        } catch {
          /* Caller displays the error. */
        }
      },
      invalidatesTags: (data, _error, arg) =>
        data
          ? [
              entityTag(arg),
              { type: "History", id: targetKey(arg) },
              listTag("search"),
            ]
          : [],
    }),
    deletePost: build.mutation<null, Target>({
      queryFn: (arg) =>
        request(async () => {
          await (arg.type === "post" ? tweetApi : commentApi).delete(arg.id);
          return null;
        }),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          removeCachedTweet(
            arg,
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
          );
        } catch {
          //
        }
      },
      invalidatesTags: (_data, error, arg) =>
        error
          ? []
          : [
              entityTag(arg),
              { type: "History", id: targetKey(arg) },
              listTag("search"),
            ],
    }),
    react: build.mutation<Partial<Tweet>, Reaction>({
      queryFn: (arg) => request(() => sendReaction(arg)),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        let previous: Partial<Tweet> | undefined;
        patchTweets(
          lifecycle.dispatch,
          lifecycle.getState() as RootState,
          (tweet) => {
            if (!matches(tweet, arg)) return;
            const original = current(tweet);
            previous ??=
              arg.action === "like"
                ? {
                    likedByMe: original.likedByMe,
                    likesCount: original.likesCount,
                  }
                : arg.action === "repost"
                  ? {
                      repostedByMe: original.repostedByMe,
                      retweetsCount: original.retweetsCount,
                    }
                  : arg.action === "bookmark"
                    ? { bookmarkedByMe: original.bookmarkedByMe }
                    : { poll: original.poll };
            switch (arg.action) {
              case "like":
                tweet.likedByMe = !arg.active;
                tweet.likesCount = Math.max(
                  0,
                  tweet.likesCount + (arg.active ? -1 : 1),
                );
                break;
              case "repost":
                tweet.repostedByMe = !arg.active;
                tweet.retweetsCount = Math.max(
                  0,
                  tweet.retweetsCount + (arg.active ? -1 : 1),
                );
                break;
              case "bookmark":
                tweet.bookmarkedByMe = !arg.active;
                break;
              case "vote": {
                if (!tweet.poll) break;
                tweet.poll.votedOptionId = arg.optionId;
                tweet.poll.totalVotes += 1;
                const option = tweet.poll.options.find(
                  (item) => item.id === arg.optionId,
                );
                if (option) option.votesCount += 1;
                break;
              }
            }
          },
        );
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchTweets(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (tweet) => {
              if (matches(tweet, arg)) Object.assign(tweet, data);
            },
          );
          const state = lifecycle.getState() as RootState;
          const lists = postsApi.util
            .selectCachedArgsForQuery(state, "getPosts")
            .filter(
              (query) =>
                query.kind === "search" ||
                (arg.action === "bookmark" && query.kind === "bookmarks") ||
                (query.kind === "profile" &&
                  ((arg.action === "like" && query.tab === "likes") ||
                    (arg.action === "repost" && query.tab === "reposts"))),
            );
          lifecycle.dispatch(
            postsApi.util.invalidateTags([
              entityTag(arg),
              ...lists.map((query) => listTag(listId(query))),
            ]),
          );
        } catch {
          if (generation !== sessionGeneration(lifecycle.getState())) return;

          patchTweets(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (tweet) => {
              if (matches(tweet, arg) && previous)
                Object.assign(tweet, previous);
            },
          );

          lifecycle.dispatch(postsApi.util.invalidateTags([entityTag(arg)]));
        }
      },
    }),
    viewPost: build.mutation<null, string>({
      queryFn: (id) =>
        request(async () => {
          await tweetApi.view(id);
          return null;
        }),
      async onQueryStarted(id, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchTweets(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (tweet) => {
              if (matches(tweet, { type: "post", id })) tweet.viewsCount += 1;
            },
          );
        } catch {
          /* A failed view counter must not block rendering the post. */
        }
      },
    }),
  }),
});

function visit(tweets: Tweet[], update: (tweet: Tweet) => void) {
  tweets.forEach((tweet) => {
    update(tweet);
    if (tweet.ancestors) visit(tweet.ancestors, update);
  });
}
function patchTweets(
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

function removeCachedTweet(
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
  patchTweets(dispatch, state, (tweet) => {
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

export const {
  useGetSearchUsersQuery,
  useGetPostsQuery,
  useGetThreadQuery,
  useGetHistoryQuery,
  useCreatePostMutation,
  useCreateCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useViewPostMutation,
} = postsApi;
