import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockAdminModerationApi } from "@/mock/handlers/admin/mockAdminModerationApi";

import type {
    ModerationItem,
    ModerationSignal,
    ModerationStatus,
} from "@/admin/components/moderation/types";

type ModerationTargetType =
    | "posts"
    | "users"
    | "comments";

const realModerationApi = {
    getItems: async (): Promise<ModerationItem[] > => {
        return apiClient.get<ModerationItem[]>(
            ENDPOINTS.admin.moderation.all,
        );
    },

    getSignals: async (
        targetType: ModerationTargetType,
        targetId: string,
    ): Promise<ModerationSignal[]> => {
        return apiClient.get<ModerationSignal[]>(
            `/admin/moderation/${targetType}/${targetId}/signals`,
        );
    },

    updateStatus: async (
        targetType: ModerationTargetType,
        targetId: string,
        status: ModerationStatus,
    ): Promise<void> => {
        await apiClient.patch(
            `/admin/moderation/${targetType}/${targetId}/status`,
            {status},
        );
    },
};

export const moderationApi = MOCK_ENABLED ? mockAdminModerationApi : realModerationApi;