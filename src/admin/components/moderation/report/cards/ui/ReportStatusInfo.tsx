import {
    reportStatusLabels,
    type ReportStatus,
    type ReportDecision,
    decisionLabels,
} from "@/admin/types/moderation.ts";

type ReportStatusProps = {
    status: ReportStatus;
    decision?: ReportDecision;
};

export default function ReportStatusInfo({
    status,
    decision,
}: ReportStatusProps) {
    return (
        <div className="mt-5 flex gap-2 flex-col border-t border-border pt-5">
            <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-muted-foreground">
                    Статус:
                </span>

                <span className="text-sm font-semibold text-foreground">
                    {reportStatusLabels[status]}
                </span>
            </div>

            {decision && (
                <>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-muted-foreground">
                            Рішення:
                        </span>

                        <span
                            className={`text-sm font-semibold ${
                                decision === "deleted" ||
                                decision === "blocked"
                                    ? "text-destructive"
                                    : "text-foreground"
                            }`}
                        >
                            {decisionLabels[decision]}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}