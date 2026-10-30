import { useCallback } from "react";

import {
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
} from "@/store/scheduleQueries";
import { errorMessage } from "@/store/appApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { scheduledErrorCleared } from "@/store/scheduleState";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
} from "@/types/schedule";

const EMPTY: ScheduledPost[] = [];

export function useScheduledPosts() {
  const dispatch = useAppDispatch();
  const backgroundError = useAppSelector(
    (state) => state.scheduledStatus.error,
  );
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, error, refetch } = useGetScheduledPostsQuery(
    undefined,
    { skip: !user },
  );
  const [createMutation] = useCreateScheduledPostMutation();
  const [updateMutation] = useUpdateScheduledPostMutation();
  const [deleteMutation] = useDeleteScheduledPostMutation();

  const create = useCallback(
    (request: CreateScheduledPostRequest) => createMutation(request).unwrap(),
    [createMutation],
  );

  const update = useCallback(
    (id: string, request: UpdateScheduledPostRequest) =>
      updateMutation({ id, data: request }).unwrap(),
    [updateMutation],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteMutation(id).unwrap();
    },
    [deleteMutation],
  );

  const refresh = useCallback(async () => {
    dispatch(scheduledErrorCleared());
    if (user) await refetch();
  }, [dispatch, refetch, user]);

  return {
    posts: data ?? EMPTY,
    isLoading,
    error: backgroundError ?? (error ? errorMessage(error) : null),
    create,
    update,
    remove,
    refresh,
  };
}
