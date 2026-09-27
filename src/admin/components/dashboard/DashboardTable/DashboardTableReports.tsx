import { Link, useNavigate } from "react-router";

import TableCard from "@/admin/components/dashboard/ui/cards/TableCard.tsx";
import Scroll from "@/admin/components/ui/Scroll.tsx";

import type { DashboardReportRow } from "@/admin/types/dashboard";

type DashboardTableReportsProps = {
    latestReports: DashboardReportRow[];
    getReportLabel: (count: number) => string;
};

export default function DashboardTableReports({
  latestReports,
  getReportLabel,
}: DashboardTableReportsProps) {
    const navigate = useNavigate();

    return (
        <div className="flex h-full min-h-0 flex-col">
            <TableCard
                title="Останні скарги"
                action={
                    <Link
                        to="/admin/moderation"
                        className="text-sm font-bold text-primary hover:underline"
                    >
                        Усі
                    </Link>
                }
            >
                    <Scroll>
                        <table className="w-full table-fixed text-left">
                            <thead className="sticky top-0 z-50 bg-muted text-muted-foreground shadow-[inset_0_-2px_0_0_var(--border)]">
                            <tr className="text-xs font-bold uppercase">
                                <th className="w-1/3 pb-2">
                                    Автор
                                </th>

                                <th className="w-1/7 pb-2">
                                    Скарги
                                </th>

                                <th className="w-1/3 pb-2 text-right">
                                    Час
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-border text-sm">
                            {latestReports.map((report) => (
                                <tr
                                    key={report.latestSignal.id}
                                    className="cursor-pointer transition-colors hover:bg-muted-foreground/10"
                                    onClick={() =>
                                        navigate(`/admin/moderation/${report.latestSignal.id}`)
                                    }
                                >
                                    <td className="py-3 font-medium">
                                        {report.targetType === "users"
                                            ? `@${report.target.username}`
                                            : `@${report.target.author.username}`}
                                    </td>

                                    <td className="py-3 font-semibold">
                                        {report.count}{" "}
                                        {getReportLabel(report.count)}
                                    </td>

                                    <td className="py-3 text-right text-muted-foreground">
                                        {new Date(
                                            report.latestSignal.createdAt,
                                        ).toLocaleDateString(
                                            "uk-UA",
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {latestReports.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Відкритих скарг немає
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </Scroll>

            </TableCard>
        </div>
    );
}