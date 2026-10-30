import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockAdminApi } from "@/mock/handlers/mockAdminApi";

import type { CreateReportRequest } from "@/features/moderation/types";

export const reportApi = {
  async create(data: CreateReportRequest): Promise<void> {
    if (MOCK_ENABLED) return mockAdminApi.createReport(data);
    await apiClient.post(ENDPOINTS[data.targetType].report(data.targetId), {
      reason: data.reason,
    });
  },
};
