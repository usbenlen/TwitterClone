import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockAdminApi } from "@/mock/handlers/admin/mockAdminApi";
import type { CreateReportRequest } from "@/types/report";

export const reportApi = {
  async create(data: CreateReportRequest): Promise<void> {
    if (MOCK_ENABLED) return mockAdminApi.createReport(data);
    await apiClient.post(ENDPOINTS[data.targetType].report(data.targetId), {
      reason: data.reason,
    });
  },
};
