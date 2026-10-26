import { useParams } from "react-router";

import { skipToken } from "@reduxjs/toolkit/query/react";

import { useAdminReportQuery, useResolveReportMutation } from "@/admin/store";

import { BackButton } from "@/components/layout/pageHeader";
import { useActionConfirmation } from "@/admin/components/ActionConfirmation";
import { QueryState } from "@/admin/components/ListControls";
import { ReportSummary, ReportPreview } from "@/admin/components/Summaries";
import { ReportActions } from "@/admin/components/ReportActions";

import { APP_ROUTES } from "@/constants/routes";
import { REPORT_ACTION_LABELS } from "@/admin/constants";

import { formatDateTime } from "@/utils/format";
import { normalizeInlineDisplayText } from "@/utils/displayText";

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
      label: REPORT_ACTION_LABELS[decision],
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
      <header className="flex items-center gap-3">
        <BackButton
          fallbackTo={APP_ROUTES.ADMIN_MODERATION}
          ariaLabel="До модерації"
          className="size-11 rounded-sm"
        />
        <h1 className="text-2xl font-bold">Розгляд скарги</h1>
      </header>
      <QueryState
        loading={query.isFetching && !report}
        error={query.error}
        empty={!report}
        retry={query.refetch}
      >
        {report && (
          <article className="min-w-0 space-y-5 rounded-2xl border border-border bg-card p-5">
            <ReportSummary report={report} />
            <ReportPreview report={report} />
            {report.resolvedAt && (
              <p className="overflow-hidden text-sm wrap-anywhere text-muted-foreground">
                Розглянуто {formatDateTime(report.resolvedAt)}
                {report.resolvedBy ? ` · @${normalizeInlineDisplayText(report.resolvedBy.username)}` : ""}
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
