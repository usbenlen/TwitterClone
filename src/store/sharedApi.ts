import {
  followApi,
  recommendationsApi,
  scheduledPostApi,
  userApi,
} from "@/api";
import type {
  CreateScheduledPostRequest,
  PaginatedRecommendations,
  RecommendationCategory,
  ScheduledPost,
  TrendRecommendationsResponse,
  UpdateScheduledPostRequest,
  User,
  UserShort,
} from "@/types";
import { request } from "@/store/api";
import { postsApi } from "@/store/postsApi";
import { sessionGeneration } from "@/store/session";

const sorted = (posts: ScheduledPost[]) =>
  [...posts].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  );

export const sharedApi = postsApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<User, string>({
      queryFn: (username) => request(() => userApi.getByUsername(username)),
      providesTags: (_data, _error, username) => [
        { type: "Profile", id: username },
      ],
    }),
    getFollowing: build.query<UserShort[], string>({
      queryFn: (userId) => request(() => followApi.following(userId)),
      providesTags: (_data, _error, userId) => [
        { type: "Following", id: userId },
      ],
    }),
    getFollowers: build.query<UserShort[], string>({
      queryFn: (userId) => request(() => followApi.followers(userId)),
      providesTags: (_data, _error, userId) => [
        { type: "Followers", id: userId },
      ],
    }),
    followUser: build.mutation<void, { viewerId: string; user: UserShort }>({
      queryFn: ({ user }) =>
        request(() => followApi.follow({ targetUserId: user.id })),
      async onQueryStarted({ viewerId, user }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            sharedApi.util.updateQueryData(
              "getFollowing",
              viewerId,
              (draft) => {
                if (!draft.some((item) => item.id === user.id))
                  draft.push(user);
              },
            ),
          );
        } catch {
          /* The caller handles the error. */
        }
      },
      invalidatesTags: (_data, error, { viewerId, user }) =>
        error
          ? []
          : [
              { type: "Following", id: viewerId },
              { type: "Followers", id: user.id },
              { type: "Profile", id: user.username },
              { type: "Recommendation", id: "USERS" },
            ],
    }),
    unfollowUser: build.mutation<void, { viewerId: string; user: UserShort }>({
      queryFn: ({ user }) =>
        request(() => followApi.unfollow({ targetUserId: user.id })),
      async onQueryStarted({ viewerId, user }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            sharedApi.util.updateQueryData("getFollowing", viewerId, (draft) =>
              draft.filter((item) => item.id !== user.id),
            ),
          );
        } catch {
          /* The caller handles the error. */
        }
      },
      invalidatesTags: (_data, error, { viewerId, user }) =>
        error
          ? []
          : [
              { type: "Following", id: viewerId },
              { type: "Followers", id: user.id },
              { type: "Profile", id: user.username },
              { type: "Recommendation", id: "USERS" },
            ],
    }),
    removeFollower: build.mutation<
      void,
      { user: UserShort; follower: UserShort }
    >({
      queryFn: ({ user, follower }) =>
        request(() =>
          followApi.removeFollower({ userId: user.id, followId: follower.id }),
        ),
      invalidatesTags: (_data, error, { user, follower }) =>
        error
          ? []
          : [
              { type: "Followers", id: user.id },
              { type: "Following", id: follower.id },
              { type: "Profile", id: user.username },
              { type: "Profile", id: follower.username },
            ],
    }),
    getTrends: build.query<TrendRecommendationsResponse, number>({
      queryFn: (limit) => request(() => recommendationsApi.trends(limit)),
      providesTags: [{ type: "Recommendation", id: "TRENDS" }],
    }),
    getRecommendedUsers: build.infiniteQuery<
      PaginatedRecommendations,
      { category: RecommendationCategory; limit: number },
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (page) => page.nextCursor ?? undefined,
      },
      queryFn: ({ queryArg, pageParam }) =>
        request(() =>
          recommendationsApi.users(
            queryArg.category,
            queryArg.limit,
            pageParam,
          ),
        ),
      providesTags: [{ type: "Recommendation", id: "USERS" }],
    }),
    getScheduledPosts: build.query<ScheduledPost[], void>({
      queryFn: () => request(async () => sorted(await scheduledPostApi.list())),
      providesTags: [{ type: "Scheduled", id: "LIST" }],
    }),
    createScheduledPost: build.mutation<
      ScheduledPost,
      CreateScheduledPostRequest
    >({
      queryFn: (data) => request(() => scheduledPostApi.create(data)),
      async onQueryStarted(_data, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          lifecycle.dispatch(
            sharedApi.util.updateQueryData(
              "getScheduledPosts",
              undefined,
              (draft) => {
                if (!draft.some((item) => item.id === data.id))
                  draft.push(data);
                draft.sort(
                  (a, b) =>
                    Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
                );
              },
            ),
          );
        } catch {
          /* The caller handles the error. */
        }
      },
      invalidatesTags: [{ type: "Scheduled", id: "LIST" }],
    }),
    updateScheduledPost: build.mutation<
      ScheduledPost,
      { id: string; data: UpdateScheduledPostRequest }
    >({
      queryFn: ({ id, data }) =>
        request(() => scheduledPostApi.update(id, data)),
      async onQueryStarted({ id }, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          const { data } = await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          lifecycle.dispatch(
            sharedApi.util.updateQueryData(
              "getScheduledPosts",
              undefined,
              (draft) => {
                const index = draft.findIndex((item) => item.id === id);
                if (index >= 0) draft[index] = data;
                draft.sort(
                  (a, b) =>
                    Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
                );
              },
            ),
          );
        } catch {
          /* The caller handles the error. */
        }
      },
      invalidatesTags: [{ type: "Scheduled", id: "LIST" }],
    }),
    deleteScheduledPost: build.mutation<void, string>({
      queryFn: (id) => request(() => scheduledPostApi.delete(id)),
      async onQueryStarted(id, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;
          lifecycle.dispatch(
            sharedApi.util.updateQueryData(
              "getScheduledPosts",
              undefined,
              (draft) => draft.filter((item) => item.id !== id),
            ),
          );
        } catch {
          /* The caller handles the error. */
        }
      },
      invalidatesTags: [{ type: "Scheduled", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetFollowingQuery,
  useGetFollowersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useRemoveFollowerMutation,
  useGetTrendsQuery,
  useGetRecommendedUsersInfiniteQuery,
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
} = sharedApi;
