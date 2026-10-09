import { current } from "@reduxjs/toolkit";
import { tweetApi, commentApi, searchApi } from "@/api";
import { appApi, request } from "@/store/api";
import type {
  User,
  UserShort,
  Tweet,
  ThreadResponse,
  EditHistoryResponse,
  CreateTweetRequest,
  CreateCommentRequest,
  UpdateTweetRequest,
  UpdateCommentRequest,
  SearchCriteria,
  SearchViewerContext,
} from "@/types";
import type { AppDispatch, RootState } from "@/store/index";
import { sessionGeneration } from "@/store/session";
import { fetchPosts, sendReaction } from "@/store/posts/operations";
import {
  matches,
  entityTag,
  listTag,
  listId,
  targetOf,
  targetKey,
  type PostsQuery,
  type Target,
  type Reaction,
} from "@/store/posts/types";
import * as cache from "@/store/posts/cache";
export { errorMessage } from "@/store/api";
export { targetOf, targetKey, reactionKey } from "@/store/posts/types";
export type {
  ProfileTab,
  PostsQuery,
  Target,
  Reaction,
} from "@/store/posts/types";

function tagsFor(tweets: Tweet[]): ReturnType<typeof entityTag>[] {
  return tweets.flatMap((tweet) => [
    entityTag(targetOf(tweet)),
    ...(tweet.quote
      ? [entityTag({ id: tweet.quote.targetId, type: tweet.quote.targetType })]
      : []),
    ...(tweet.ancestors ? tagsFor(tweet.ancestors) : []),
  ]);
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
    updatePost: build.mutation<
      Tweet,
      | ({ type: "post"; id: string } & { data: UpdateTweetRequest })
      | ({ type: "comment"; id: string } & { data: UpdateCommentRequest })
    >({
      queryFn: (arg) =>
        request(() =>
          arg.type === "post"
            ? tweetApi.update(arg.id, arg.data)
            : commentApi.update(arg.id, arg.data),
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

function patchTweets(
  dispatch: AppDispatch,
  state: RootState,
  update: (tweet: Tweet) => void,
): void {
  cache.patchTweets(postsApi, dispatch, state, update);
}
export function removeCachedTweet(
  target: Target,
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.removeCachedTweet(postsApi, target, dispatch, state);
}
export function updateCachedProfileAuthors(
  user: User,
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.updateCachedProfileAuthors(postsApi, user, dispatch, state);
}
export function publishPosts(
  tweets: Tweet[],
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.publishPosts(postsApi, tweets, dispatch, state);
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
