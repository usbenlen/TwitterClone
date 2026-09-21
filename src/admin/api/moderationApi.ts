import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockAdminModerationApi } from "@/mock/handlers/admin/mockAdminModerationApi";

import type {
    ModerationItem,
    ModerationStatus,
} from "@/admin/types/moderation";

const realModerationApi = {
    getItems: async (): Promise<ModerationItem[]> => {
        return apiClient.get<ModerationItem[]>(
            ENDPOINTS.admin.moderation.all,
        );
    },

    updateStatus: async (
        type: Exclude<ModerationItem["type"], "all">,
        itemId: string,
        status: ModerationStatus,
    ): Promise<void> => {
        await apiClient.patch(
            ENDPOINTS.admin.moderation.updateStatus(itemId),
            {
                type,
                status,
            },
        );
    },

    deletePost: async (postId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.post.delete(postId),
        );
    },

    deleteComment: async (commentId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.comment.delete(commentId),
        );
    },

    blockUser: async (userId: string): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.user.block(userId),
        );
    },

    unblockUser: async (userId: string): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.user.unblock(userId),
        );
    },

    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.user.delete(userId),
        );
    },
};

export const moderationApi = MOCK_ENABLED ? mockAdminModerationApi : realModerationApi;