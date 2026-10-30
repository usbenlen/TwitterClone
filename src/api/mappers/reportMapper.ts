import { mapBackendPost } from "@/api/mappers/postMapper";
import { mapUserRole } from "@/api/mappers/profileMapper";

import type { BackendReport, ReportSignal } from "@/types";

export function mapReportTarget(
  target: BackendReport["target"],
): ReportSignal["target"] {
  if (!target) return null;
  if (target.type === "users")
    return { type: target.type, data: mapUserRole(target.data) };

  return {
    type: target.type,
    data: {
      ...mapBackendPost(target.data),
      isComment: target.type === "comments",
    },
  };
}

export function mapReport(report: BackendReport): ReportSignal {
  return { ...report, target: mapReportTarget(report.target) };
}
