import { useDashboardTables } from "@/admin/hooks/dasboard/useDashboardTables.ts";

import DashboardTableReports from "./DashboardTableReports.tsx";
import DashboardTableUsers from "./DashboardTableUsers.tsx";

export default function DashboardTable() {
    const {
        latestUsers,
        latestReports,
        openReportsCount,
        getReportLabel,
    } = useDashboardTables();

    return (
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <DashboardTableReports
                latestReports={latestReports}
                openReportsCount={openReportsCount}
                getReportLabel={getReportLabel}
            />

            <DashboardTableUsers
                latestUsers={latestUsers}
            />
        </div>
    );
}