import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapBackendPollToTweetPoll,
  type BackendPollResponse,
  type BackendPost,
} from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockPollApi } from "@/mock/handlers";

import type { TweetPoll } from "@/types/poll";

const realPollApi = {
  async get(
    targetType: "post" | "comment",
    targetId: string,
  ): Promise<TweetPoll | null> {
    const post =
      targetType === "post"
        ? await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(targetId))
        : (
            await apiClient.get<{ target: BackendPost }>(
              ENDPOINTS.comments.thread(targetId),
            )
          ).target;
    return mapBackendPollToTweetPoll(post.poll) ?? null;
  },

  async vote(
    targetType: "post" | "comment",
    targetId: string,
    optionId: string,
  ): Promise<TweetPoll> {
    const poll = await apiClient.post<BackendPollResponse>(
      ENDPOINTS.poll.vote(targetType, targetId),
      {
        optionId,
      },
    );

    return mapBackendPollToTweetPoll(poll)!;
  },
};

export const pollApi = MOCK_ENABLED ? mockPollApi : realPollApi;
