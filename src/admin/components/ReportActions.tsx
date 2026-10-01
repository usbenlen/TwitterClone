import type { ReactNode } from "react";
import { Button } from "@/ui/Button";
import { REPORT_ACTION_ICONS, REPORT_ACTION_LABELS } from "@/admin/constants";
import type { ReportDecision, ReportSignal } from "@/types/report";

export function ReportActions({
  report,
  busy,
  onAction,
  leading,
}: {
  report: ReportSignal;
  busy: boolean;
  onAction: (decision: ReportDecision) => void;
  leading?: ReactNode;
}) {
  if (report.status === "resolved" && !leading) return null;
  const decisions: ReportDecision[] =
    report.status === "resolved" ? [] : ["kept"];
  if (report.status !== "resolved" && report.target) {
    decisions.push("deleted");
    if (report.targetType === "users") decisions.push("blocked");
  }
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 sm:justify-end">
      {leading && <div className="sm:mr-auto">{leading}</div>}
      {decisions.map((decision) => {
        const Icon = REPORT_ACTION_ICONS[decision];
        return (
          <Button
            key={decision}
            size="comfortable"
            shape="rounded"
            variant={decision === "deleted" ? "destructive" : "outline"}
            disabled={busy}
            onClick={() => onAction(decision)}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {REPORT_ACTION_LABELS[decision]}
          </Button>
        );
      })}
    </div>
  );
}
