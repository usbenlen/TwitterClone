/** @format */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockPollApi } from "@/mock/handlers";

import type { TweetPoll } from "@/types/poll";

const realPollApi = {
  vote(tweetId: string, optionId: string) {
    return apiClient.post<TweetPoll>(ENDPOINTS.poll.vote(tweetId), {
      optionId,
    });
  },
};

export const pollApi = MOCK_ENABLED ? mockPollApi : realPollApi;
