import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";
import { mapBackendPollToPostPoll } from "@/api/mappers/postMapper";

import type { BackendPollResponse, BackendPost, PostPoll } from "@/types";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockPollApi } from "@/mock/handlers/mockPollApi";

const realPollApi = {
  async get(
    targetType: "post" | "comment",
    targetId: string,
  ): Promise<PostPoll | null> {
    const post =
      targetType === "post"
        ? await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(targetId))
        : (
            await apiClient.get<{ target: BackendPost }>(
              ENDPOINTS.comments.thread(targetId),
            )
          ).target;
    return mapBackendPollToPostPoll(post.poll) ?? null;
  },

  async vote(
    targetType: "post" | "comment",
    targetId: string,
    optionId: string,
  ): Promise<PostPoll> {
    const poll = await apiClient.post<BackendPollResponse>(
      ENDPOINTS.poll.vote(targetType, targetId),
      {
        optionId,
      },
    );

    return mapBackendPollToPostPoll(poll)!;
  },
};

export const pollApi = MOCK_ENABLED ? mockPollApi : realPollApi;
