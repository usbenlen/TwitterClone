import type { ReportSignal } from "@/admin/types/moderation.ts";

type ReportHeaderProps = {
    report: ReportSignal;
};

export default function ReportHeader({
    report,
}: ReportHeaderProps) {
    return (
        <div className="mt-5">
            <h1 className="text-2xl font-semibold">
                Деталі модерації: {report.id}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
                {report.targetType === "posts" && "Пост"}
                {report.targetType === "comments" && "Коментар"}
                {report.targetType === "users" && "Користувач"}

                {report.targetId}
            </p>
        </div>
    );
}