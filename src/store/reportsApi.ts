import { appApi, request } from "@/store/api";
import { reportApi } from "@/api/report.api";
import type { CreateReportRequest } from "@/types/report";

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
