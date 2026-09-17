import { DashboardMetric, DashboardChart, DashboardTable } from "@/admin/components/dashboard/index.ts";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-4">
            <DashboardMetric/>
            <DashboardChart/>
            <DashboardTable/>
        </div>
    )
}