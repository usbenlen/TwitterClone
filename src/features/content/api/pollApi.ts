import { mapBackendPollToPostPoll } from "@/features/content/api/mappers/postMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockPollApi } from "@/mock/handlers/mockPollApi";

import type {
  BackendPollResponse,
  BackendPost,
  PostPoll,
} from "@/features/content/types";

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
