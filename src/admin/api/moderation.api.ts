import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockModerationApi } from "@/mock/handlers/admin/mockModerationApi.ts";

import type {
    ReportDecision,
    ReportSignal,
    ReportStatus,
    ReportTargetType,
} from "@/admin/types/moderation";

const realModerationApi = {
    getItems: async (): Promise<ReportSignal[]> => {
        return apiClient.get<ReportSignal[]>(
            ENDPOINTS.admin.moderation.all,
        );
    },

    getById: async (
        reportId: string,
    ): Promise<ReportSignal> => {
        return apiClient.get<ReportSignal>(
            ENDPOINTS.admin.moderation.byId(reportId),
        );
    },

    updateStatus: async (
        type: ReportTargetType,
        itemId: string,
        status: ReportStatus,
        decision?: ReportDecision,
    ): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.updateStatus(itemId),
            {
                type,
                status,
                decision,
            },
        );
    },

    deletePost: async (
        postId: string,
    ): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.post.delete(postId),
        );
    },

    deleteComment: async (
        commentId: string,
    ): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.comment.delete(commentId),
        );
    },

    blockUser: async (
        userId: string,
    ): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.user.block(userId),
        );
    },

    unblockUser: async (
        userId: string,
    ): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.user.unblock(userId),
        );
    },

    deleteUser: async (
        userId: string,
    ): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.user.delete(userId),
        );
    },
};

export const moderationApi = MOCK_ENABLED ? mockModerationApi : realModerationApi;