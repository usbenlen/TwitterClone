import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockReportApi } from "@/mock/handlers/admin/mockReportApi";

import type {
    ReportReason,
    ReportTargetType,
} from "@/admin/types/moderation";

const realReportApi = {
    report: async (
        targetType: ReportTargetType,
        targetId: string,
        reason: ReportReason,
    ): Promise<void> => {
        const endpoint =
            targetType === "posts"
                ? ENDPOINTS.posts.report(targetId)
                : targetType === "comments"
                    ? ENDPOINTS.comments.report(targetId)
                    : ENDPOINTS.users.report(targetId);

        await apiClient.post(endpoint, {
            reason,
        });
    },
};

export const reportApi = MOCK_ENABLED ? mockReportApi : realReportApi;