import { Link, useParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAdminReportQuery, useResolveReportMutation } from "@/admin/store";
import { useActionConfirmation } from "@/admin/components/ActionConfirmation";
import { QueryState } from "@/admin/components/ListControls";
import { ReportSummary, ReportPreview } from "@/admin/components/Summaries";
import { ReportActions } from "@/admin/components/ReportActions";
import { APP_ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/utils/format";
import type { ReportDecision } from "@/types/report";

export default function ReportPage() {
  const { reportId } = useParams();
  const query = useAdminReportQuery(reportId ?? skipToken);
  const [mutate] = useResolveReportMutation();
  const confirmation = useActionConfirmation();
  const report = query.currentData;

  const act = (decision: ReportDecision) => {
    if (!report) return;
    confirmation.ask({
      label:
        decision === "kept"
          ? "Залишити"
          : decision === "deleted"
            ? "Видалити"
            : "Заблокувати",
      tasks: [
        {
          id: report.id,
          run: () => mutate({ id: report.id, decision }).unwrap(),
        },
      ],
    });
  };
  return (
    <>
      <Link
        to={APP_ROUTES.ADMIN_MODERATION}
        className="text-sm text-primary hover:underline"
      >
        ← До модерації
      </Link>
      <h1 className="text-2xl font-bold">Розгляд скарги</h1>
      <QueryState
        loading={query.isFetching && !report}
        error={query.error}
        empty={!report}
        retry={query.refetch}
      >
        {report && (
          <article className="space-y-5 rounded-2xl border border-border p-5">
            <ReportSummary report={report} />
            <ReportPreview report={report} />
            {report.resolvedAt && (
              <p className="text-sm text-muted-foreground">
                Розглянуто {formatDateTime(report.resolvedAt)}
                {report.resolvedBy ? ` · @${report.resolvedBy.username}` : ""}
              </p>
            )}
            <ReportActions
              report={report}
              busy={confirmation.busy || query.isFetching}
              onAction={act}
            />
          </article>
        )}
      </QueryState>
      {confirmation.modal}
    </>
  );
}
