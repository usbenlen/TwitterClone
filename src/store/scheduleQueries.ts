import { scheduledPostApi } from "@/api/scheduledPostApi";

import type {
  ScheduledPost,
  CreateScheduledPostRequest,
  UpdateScheduledPostRequest,
} from "@/types/schedule";

import { appApi, request } from "@/store/appApi";
import { sessionGeneration } from "@/store/session";

const sorted = (posts: ScheduledPost[]) =>
  [...posts].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  );

export const scheduleQueries = appApi.injectEndpoints({
  endpoints: (build) => ({
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
            scheduleQueries.util.updateQueryData(
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
          /* The caller handles the error */
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
            scheduleQueries.util.updateQueryData(
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
          /* The caller handles the error */
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
            scheduleQueries.util.updateQueryData(
              "getScheduledPosts",
              undefined,
              (draft) => draft.filter((item) => item.id !== id),
            ),
          );
        } catch {
          /* The caller handles the error */
        }
      },
      invalidatesTags: [{ type: "Scheduled", id: "LIST" }],
    }),
  }),
});

export const {
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
} = scheduleQueries;
