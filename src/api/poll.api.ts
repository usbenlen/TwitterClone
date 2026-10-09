import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapBackendPollToTweetPoll,
  type BackendPollResponse,
} from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockPollApi } from "@/mock/handlers";

import type { TweetPoll } from "@/types/poll";

const realPollApi = {
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
