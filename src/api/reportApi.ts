import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockAdminApi } from "@/mock/handlers/mockAdminApi";

import type { CreateReportRequest } from "@/types/report";

export const reportApi = {
  async create(data: CreateReportRequest): Promise<void> {
    if (MOCK_ENABLED) return mockAdminApi.createReport(data);
    await apiClient.post(ENDPOINTS[data.targetType].report(data.targetId), {
      reason: data.reason,
    });
  },
};
