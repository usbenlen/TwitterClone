import { current } from "@reduxjs/toolkit";

import { commentApi } from "@/features/content/api/commentApi";
import { pollApi } from "@/features/content/api/pollApi";
import { postApi } from "@/features/content/api/postApi";
import { pollsMatch, withPollVote } from "@/features/content/lib/posts/poll";
import * as cache from "@/features/content/model/postCache";
import {
  fetchPosts,
  sendReaction,
} from "@/features/content/model/postOperations";
import {
  entityTag,
  listId,
  listTag,
  matches,
  targetKey,
  targetOf,
} from "@/features/content/model/postTargets";
import { recommendationsApi, searchApi } from "@/features/discovery/api";
import { appApi, request } from "@/shared/store/appApi";
import { sessionGeneration } from "@/shared/store/session";

import type { AppDispatch, RootState } from "@/app/store/store";
import type {
  CreateCommentRequest,
  CreatePostRequest,
  EditHistoryResponse,
  Post,
  PostPoll,
  PostsQuery,
  Reaction,
  Target,
  ThreadResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
} from "@/features/content/types";
import type {
  PaginatedRecommendedPosts,
  SearchCriteria,
  SearchViewerContext,
} from "@/features/discovery/types";
import type { User, UserShort } from "@/features/profiles/types";

function tagsFor(posts: Post[]): ReturnType<typeof entityTag>[] {
  return posts.flatMap((post) => [
    entityTag(targetOf(post)),
    ...(post.quote
      ? [entityTag({ id: post.quote.targetId, type: post.quote.targetType })]
      : []),
    ...(post.ancestors ? tagsFor(post.ancestors) : []),
  ]);
}

export const postsApi = appApi.injectEndpoints({
  endpoints: (build) => ({
    getPollState: build.query<PostPoll | null, Target>({
      queryFn: (target) => request(() => pollApi.get(target.type, target.id)),
      providesTags: (_data, _error, target) => [
        { type: "Poll", id: targetKey(target) },
      ],
      merge(currentPoll, incoming) {
        // A read begun before voting must not erase the user's confirmed choice
        if (
          currentPoll &&
          incoming &&
          pollsMatch(currentPoll, incoming) &&
          currentPoll.votedOptionId &&
          !incoming.votedOptionId
        )
          return;
        return incoming;
      },
    }),
    getPosts: build.query<Post[], PostsQuery>({
      queryFn: (arg) => request(() => fetchPosts(arg)),
      providesTags: (data, _error, arg) => [
        listTag(listId(arg)),
        ...tagsFor(data ?? []),
      ],
    }),

    getRecommendedPosts: build.infiniteQuery<
      PaginatedRecommendedPosts,
      number,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (page) => page.hasMore ? page.nextCursor ?? undefined : undefined,
      },

      queryFn: ({ queryArg, pageParam }) => request(() => recommendationsApi.posts(queryArg, pageParam)),

      providesTags: (data) => [
        listTag("recommended"),
        ...tagsFor(data?.pages.flatMap((page) => page.items) ?? []),
      ],
    }),

    getSearchUsers: build.query<
      UserShort[],
      { criteria: SearchCriteria; viewer: SearchViewerContext }
    >({
      queryFn: ({ criteria, viewer }) => request(() => searchApi.users(criteria, viewer)),
    }),

    getThread: build.query<ThreadResponse, string | Target>({
      queryFn: (target) =>
        request(() =>
          typeof target === "string"
            ? commentApi.getThread(target)
            : commentApi.getThread(target.id, target.type),
        ),
      providesTags: (data) =>
        data ? tagsFor([data.target, ...data.ancestors, ...data.replies]) : [],
    }),

    getHistory: build.query<EditHistoryResponse, Target>({
      queryFn: (arg) =>
        request(() =>
          (arg.type === "post" ? postApi : commentApi).getEditHistory(arg.id),
        ),
      providesTags: (_data, _error, arg) => [
        { type: "History", id: targetKey(arg) },
      ],
    }),

    createPost: build.mutation<Post, CreatePostRequest>({
      queryFn: (arg) => request(() => postApi.create(arg)),
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

    createComment: build.mutation<Post, CreateCommentRequest>({
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
      Post,
      | ({ type: "post"; id: string } & { data: UpdatePostRequest })
      | ({ type: "comment"; id: string } & { data: UpdateCommentRequest })
    >({
      queryFn: (arg) =>
        request(() =>
          arg.type === "post"
            ? postApi.update(arg.id, arg.data)
            : commentApi.update(arg.id, arg.data),
        ),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchPosts(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (post) => {
              if (matches(post, arg)) Object.assign(post, data);
              if (
                post.quote?.targetId === arg.id &&
                post.quote.targetType === arg.type
              )
                post.quote.hasNewVersion = true;
            },
          );
        } catch {
          /* Caller displays the error */
        }
      },
      invalidatesTags: (data, _error, arg) =>
        data
          ? [
              entityTag(arg),
              { type: "Poll", id: targetKey(arg) },
              { type: "History", id: targetKey(arg) },
              listTag("search"),
            ]
          : [],
    }),

    deletePost: build.mutation<null, Target>({
      queryFn: (arg) =>
        request(async () => {
          await (arg.type === "post" ? postApi : commentApi).delete(arg.id);
          return null;
        }),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          removeCachedPost(
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
              { type: "Poll", id: targetKey(arg) },
              { type: "History", id: targetKey(arg) },
              listTag("search"),
            ],
    }),

    react: build.mutation<Partial<Post>, Reaction>({
      queryFn: (arg) => request(() => sendReaction(arg)),
      async onQueryStarted(arg, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        if (arg.action === "vote") {
          const target: Target = { type: arg.type, id: arg.id };
          const apply = (poll: PostPoll) => {
            cache.patchPoll(
              postsApi,
              lifecycle.dispatch,
              lifecycle.getState() as RootState,
              target,
              arg.poll,
              poll,
            );
          };

          const optimistic = withPollVote(arg.poll, arg.optionId);
          lifecycle.dispatch(
            postsApi.util.upsertQueryEntries([
              { endpointName: "getPollState", arg: target, value: optimistic },
            ]),
          );

          apply(optimistic);

          try {
            const { data } = await lifecycle.queryFulfilled;

            if (generation !== sessionGeneration(lifecycle.getState())) return;
            if (data.poll) {
              lifecycle.dispatch(
                postsApi.util.upsertQueryEntries([
                  {
                    endpointName: "getPollState",
                    arg: target,
                    value: data.poll,
                  },
                ]),
              );

              apply(data.poll);
            }
          } catch {
            if (generation !== sessionGeneration(lifecycle.getState())) return;

            // Rollback bypasses merge, which otherwise protects a selected option
            lifecycle.dispatch(
              postsApi.util.updateQueryData(
                "getPollState",
                target,
                () => arg.poll,
              ),
            );

            apply(arg.poll);
          }

          lifecycle.dispatch(postsApi.util.invalidateTags([entityTag(arg)]));
          return;
        }
        let previous: Partial<Post> | undefined;
        patchPosts(
          lifecycle.dispatch,
          lifecycle.getState() as RootState,
          (post) => {
            if (!matches(post, arg)) return;
            const original = current(post);
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
                  : { bookmarkedByMe: original.bookmarkedByMe };
            switch (arg.action) {
              case "like":
                post.likedByMe = !arg.active;
                post.likesCount = Math.max(
                  0,
                  post.likesCount + (arg.active ? -1 : 1),
                );
                break;
              case "repost":
                post.repostedByMe = !arg.active;
                post.retweetsCount = Math.max(
                  0,
                  post.retweetsCount + (arg.active ? -1 : 1),
                );
                break;
              case "bookmark":
                post.bookmarkedByMe = !arg.active;
                break;
            }
          },
        );
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchPosts(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (post) => {
              if (matches(post, arg)) Object.assign(post, data);
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

          patchPosts(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (post) => {
              if (matches(post, arg) && previous)
                Object.assign(post, previous);
            },
          );

          lifecycle.dispatch(postsApi.util.invalidateTags([entityTag(arg)]));
        }
      },
    }),

    viewPost: build.mutation<null, string>({
      queryFn: (id) =>
        request(async () => {
          await postApi.view(id);
          return null;
        }),
      async onQueryStarted(id, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          patchPosts(
            lifecycle.dispatch,
            lifecycle.getState() as RootState,
            (post) => {
              if (matches(post, { type: "post", id })) post.viewsCount += 1;
            },
          );
        } catch {
          /* A failed view counter must not block rendering the post. */
        }
      },
    }),
  }),
});

function patchPosts(
  dispatch: AppDispatch,
  state: RootState,
  update: (post: Post) => void,
): void {
  cache.patchPosts(postsApi, dispatch, state, update);
}

export function removeCachedPost(
  target: Target,
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.removeCachedPost(postsApi, target, dispatch, state);
}

export function updateCachedProfileAuthors(
  user: User,
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.updateCachedProfileAuthors(postsApi, user, dispatch, state);
}

export function publishPosts(
  posts: Post[],
  dispatch: AppDispatch,
  state: RootState,
): void {
  cache.publishPosts(postsApi, posts, dispatch, state);
}

export const {
  useGetRecommendedPostsInfiniteQuery,
  useGetPollStateQuery,
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
