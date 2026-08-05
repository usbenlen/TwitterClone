/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { Tweet, CreateTweetRequest } from "@/types/tweet";
import { MOCK_ENABLED } from "@/mock/config";
import { mockTweetApi } from "@/mock/handlers";

const realTweetApi = {
  getFeed: () => apiClient.get<Tweet[]>(ENDPOINTS.tweets.feed),

  getByUsername: (username: string) =>
    apiClient.get<Tweet[]>(ENDPOINTS.tweets.byUsername(username)),

  create: (data: CreateTweetRequest) =>
    apiClient.post<Tweet>(ENDPOINTS.tweets.create, data),

  toggleLike: (id: string) =>
    apiClient.post<{ likedByMe: boolean; likesCount: number }>(
      ENDPOINTS.tweets.like(id),
    ),
};

export const tweetApi = MOCK_ENABLED ? mockTweetApi : realTweetApi;
