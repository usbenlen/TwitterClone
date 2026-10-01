import { useState } from "react";
import { Link } from "react-router";

import {
  useAdminAnalyticsQuery,
  useAdminMetricsQuery,
  useAdminTablesQuery,
} from "@/admin/store";
import { DASHBOARD_TABLE_LIMIT } from "@/admin/constants";
import { activitySeries } from "@/admin/analytics";
import { AnalyticsChart } from "@/admin/components/AnalyticsChart";
import { QueryState, Select } from "@/admin/components/ListControls";
import { ReportSummary, UserSummary } from "@/admin/components/Summaries";

import { APP_ROUTES } from "@/constants/routes";
import { formatCompactCount } from "@/utils/format";

import type { AnalyticsPeriod, ContentType } from "@/admin/types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [contentType, setContentType] = useState<ContentType>("all");
  const metrics = useAdminMetricsQuery(undefined);
  const analytics = useAdminAnalyticsQuery(period);
  const tables = useAdminTablesQuery(DASHBOARD_TABLE_LIMIT);
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold">Огляд</h1>
        <p className="mt-1 text-muted-foreground">
          Активність, аудиторія та останні скарги.
        </p>
      </header>
      <QueryState
        loading={metrics.isFetching && !metrics.currentData}
        error={metrics.error}
        retry={metrics.refetch}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.currentData?.map((metric) => (
            <section
              key={metric.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="text-sm text-muted-foreground">{metric.title}</h2>
              <p className="mt-3 text-3xl font-bold">
                {metric.value === null ? "—" : formatCompactCount(metric.value)}
              </p>
            </section>
          ))}
        </div>
      </QueryState>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-bold">Панель аналітики</h2>
        <div className="flex flex-wrap gap-3">
          <Select
            label="Період"
            value={period}
            options={{ "7d": "7 днів", "30d": "30 днів" }}
            onChange={setPeriod}
          />
          <Select
            label="Активність"
            value={contentType}
            options={{
              all: "Увесь контент",
              posts: "Дописи",
              comments: "Коментарі",
            }}
            onChange={setContentType}
          />
        </div>
      </div>
      <QueryState
        loading={analytics.isFetching && !analytics.currentData}
        error={analytics.error}
        retry={analytics.refetch}
      >
        {analytics.currentData && (
          <div className="grid gap-4 xl:grid-cols-2">
            <AnalyticsChart
              title="Зростання аудиторії"
              series={analytics.currentData.audience[period]}
              kind="line"
            />
            <AnalyticsChart
              title="Активність"
              series={activitySeries(
                analytics.currentData,
                period,
                contentType,
              )}
              kind="bar"
            />
          </div>
        )}
      </QueryState>
      <QueryState
        loading={tables.isFetching && !tables.currentData}
        error={tables.error}
        retry={tables.refetch}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-border p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-bold">Останні скарги</h2>
              <Link
                to={APP_ROUTES.ADMIN_MODERATION}
                className="text-sm text-primary hover:underline"
              >
                Усі скарги
              </Link>
            </div>
            <div className="divide-y divide-border">
              {tables.currentData?.latestReports.map((row) => (
                <div
                  key={`${row.targetType}:${row.targetId}`}
                  className="space-y-1 py-3"
                >
                  <ReportSummary report={row.latestSignal} />
                  <p className="text-xs text-muted-foreground">
                    Скарг на об’єкт: {row.count}
                  </p>
                </div>
              ))}
              {tables.currentData?.latestReports.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Скарг поки немає.
                </p>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-border p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-bold">Нові користувачі</h2>
              <Link
                to={APP_ROUTES.ADMIN_USERS}
                className="text-sm text-primary hover:underline"
              >
                Усі користувачі
              </Link>
            </div>
            <div className="space-y-4">
              {tables.currentData?.latestUsers.map((user) => (
                <UserSummary key={user.id} user={user} />
              ))}
            </div>
          </section>
        </div>
      </QueryState>
    </>
  );
}
