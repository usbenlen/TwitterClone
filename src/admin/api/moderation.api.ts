import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockModerationApi } from "@/mock/handlers/admin/mockModerationApi.ts";

import type {
    ModerationListParams,
    ModerationListResponse,
    ReportDecision,
    ReportSignal,
    ReportStatus,
} from "@/admin/types/moderation";

const realModerationApi = {
    getItems: async (
        params: ModerationListParams = {},
    ): Promise<ModerationListResponse> => {
        const searchParams =
            new URLSearchParams();

        if (params.page) {
            searchParams.set(
                "page",
                String(params.page),
            );
        }

        if (
            params.search &&
            params.search.trim()
        ) {
            searchParams.set(
                "search",
                params.search.trim(),
            );
        }

        if (
            params.type &&
            params.type !== "all"
        ) {
            searchParams.set(
                "type",
                params.type,
            );
        }

        if (
            params.source &&
            params.source !== "all"
        ) {
            searchParams.set(
                "source",
                params.source,
            );
        }

        if (
            params.status &&
            params.status !== "all"
        ) {
            searchParams.set(
                "status",
                params.status,
            );
        }

        if (
            params.decision &&
            params.decision !== "all"
        ) {
            searchParams.set(
                "decision",
                params.decision,
            );
        }

        if (params.sort) {
            searchParams.set(
                "sort",
                params.sort,
            );
        }

        const query = searchParams.toString();

        const endpoint = query
            ? `${ENDPOINTS.admin.moderation.all}?${query}`
            : ENDPOINTS.admin.moderation.all;

        return apiClient.get<ModerationListResponse>(endpoint);
    },

    getById: async (reportId: string): Promise<ReportSignal> => {
        return apiClient.get<ReportSignal>(
            ENDPOINTS.admin.moderation.byId(reportId),
        );
    },

    updateStatus: async (
        reportId: string,
        status: ReportStatus,
        decision?: ReportDecision,
    ): Promise<void> => {
        await apiClient.put(
            ENDPOINTS.admin.moderation.updateStatus(reportId),
            {
                status,
                decision,
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

    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.admin.moderation.user.delete(userId),
        );
    },
};

export const moderationApi = MOCK_ENABLED ? mockModerationApi : realModerationApi;