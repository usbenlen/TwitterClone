import { reportApi } from "@/features/moderation/api/reportApi";
import { appApi, request } from "@/shared/store/appApi";

import type { CreateReportRequest } from "@/features/moderation/types";

export const reportsApi = appApi.injectEndpoints({
  endpoints: (build) => ({
    createReport: build.mutation<void, CreateReportRequest>({
      queryFn: (data) => request(() => reportApi.create(data)),
      invalidatesTags: (_data, error) =>
        error
          ? []
          : [
              "Report",
              { type: "Dashboard", id: "METRICS" },
              { type: "Dashboard", id: "TABLES" },
            ],
    }),
  }),
});

export const { useCreateReportMutation } = reportsApi;
