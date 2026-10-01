import { Button } from "@/ui/Button";
import type { ReportDecision, ReportSignal } from "@/types/report";

export function ReportActions({
  report,
  busy,
  onAction,
}: {
  report: ReportSignal;
  busy: boolean;
  onAction: (decision: ReportDecision) => void;
}) {
  if (report.status === "resolved") return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => onAction("kept")}
      >
        Залишити
      </Button>
      {report.target && (
        <>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => onAction("deleted")}
          >
            Видалити
          </Button>
          {report.targetType === "users" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onAction("blocked")}
            >
              Заблокувати
            </Button>
          )}
        </>
      )}
    </div>
  );
}
