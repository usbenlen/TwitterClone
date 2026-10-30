import { followApi } from "@/features/profiles/api/followApi";
import { appApi, request } from "@/shared/store/appApi";

import type { UserShort } from "@/features/profiles/types";

export const followQueries = appApi.injectEndpoints({
  endpoints: (build) => ({
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
            followQueries.util.updateQueryData(
              "getFollowing",
              viewerId,
              (draft) => {
                if (!draft.some((item) => item.id === user.id))
                  draft.push(user);
              },
            ),
          );
        } catch {
          /* The caller handles the error */
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
            followQueries.util.updateQueryData("getFollowing", viewerId, (draft) =>
              draft.filter((item) => item.id !== user.id),
            ),
          );
        } catch {
          /* The caller handles the error */
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
  }),
});

export const {
  useGetFollowingQuery,
  useGetFollowersQuery,
} = followQueries;
