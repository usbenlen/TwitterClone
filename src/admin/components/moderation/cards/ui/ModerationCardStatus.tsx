import {
    decisionLabels,
    reportStatusLabels,
    type ReportDecision,
    type ReportStatus,
} from "@/admin/types/moderation";

type ModerationCardStatusProps = {
    status: ReportStatus;
    decision?: ReportDecision;
};

export default function ModerationCardStatus({
    status,
    decision,
}: ModerationCardStatusProps) {
    return (
        <div className="mt-2 flex items-center gap-1">
            <span className="text-sm font-semibold text-muted-foreground">
                Статус:
            </span>

            <span className="text-sm font-semibold text-foreground">
                {reportStatusLabels[status]}
            </span>

            {decision && (
                <>
                    <span className="text-sm font-semibold text-muted-foreground pl-1">
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
                </>
            )}
        </div>
    );
}