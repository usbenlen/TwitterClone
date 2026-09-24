import { useDashboardTables } from "@/admin/hooks/dasboard";

import DashboardTableReports from "./DashboardTableReports.tsx";
import DashboardTableUsers from "./DashboardTableUsers.tsx";

export default function DashboardTable() {
    const {
        latestUsers,
        latestReports,
        getReportLabel,
    } = useDashboardTables();

    return (
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <DashboardTableReports
                latestReports={latestReports}
                getReportLabel={getReportLabel}
            />

            <DashboardTableUsers
                latestUsers={latestUsers}
            />
        </div>
    );
}