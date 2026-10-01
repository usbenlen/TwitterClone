import type {
  AnalyticsPoint,
  ContentType,
  DashboardAnalytics,
  AnalyticsPeriod,
} from "@/admin/types";

export function activitySeries(
  data: DashboardAnalytics,
  period: AnalyticsPeriod,
  type: ContentType,
): AnalyticsPoint[] {
  const activity = data.activity[period];
  if (type !== "all") return activity[type];

  const totals = new Map<string, number>();

  for (const point of [...activity.posts, ...activity.comments])
    totals.set(point.date, (totals.get(point.date) ?? 0) + point.value);

  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function chartGeometry(data: AnalyticsPoint[]) {
  const max = Math.max(1, ...data.map((point) => point.value));
  const points = data.map((point, index) => ({
    ...point,
    x: data.length === 1 ? 50 : (index * 100) / Math.max(1, data.length - 1),
    y: 100 - (point.value / max) * 95,
  }));

  return {
    max,
    points,
    path: points.map((point) => `${point.x},${point.y}`).join(" "),
    total: data.reduce((sum, point) => sum + point.value, 0),
  };
}
