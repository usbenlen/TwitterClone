import { useState } from "react";
import { chartGeometry } from "@/admin/analytics";
import { formatCompactCount } from "@/utils/format";
import { APP_LOCALE } from "@/constants/app";
import type { AnalyticsPoint } from "@/admin/types";

export function AnalyticsChart({
  title,
  series,
  kind,
}: {
  title: string;
  series: AnalyticsPoint[];
  kind: "line" | "bar";
}) {
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const { max, points, total } = chartGeometry(series);
  const plotPath = points
    .map((point) => `${point.x * 6},${point.y * 2.4}`)
    .join(" ");

  const active = series.find((point) => point.date === activeDate);

  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat(APP_LOCALE, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));

  const value = kind === "line" ? (series.at(-1)?.value ?? 0) : total;

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{formatCompactCount(value)}</p>
      {kind === "bar" && (
        <p className="text-sm text-muted-foreground">
          У середньому{" "}
          {formatCompactCount(series.length ? total / series.length : 0)} на
          день
        </p>
      )}
      <div
        className="my-3 h-6 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {active
          ? `${dateLabel(active.date)} · ${formatCompactCount(active.value)}`
          : "Наведіть курсор або виберіть точку клавіатурою"}
      </div>
      <div className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex h-52 w-8 shrink-0 flex-col justify-between text-xs text-muted-foreground"
        >
          {[1, 0.75, 0.5, 0.25, 0].map((part) => (
            <span key={part}>{formatCompactCount(max * part)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex h-52 flex-col justify-between"
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="border-t border-dashed border-border"
              />
            ))}
          </div>
          {kind === "line" ? (
            <svg
              viewBox="-6 -6 612 252"
              preserveAspectRatio="none"
              className="relative h-52 w-full overflow-visible"
              aria-label={title}
            >
              <polygon
                points={`0,240 ${plotPath} 600,240`}
                className="fill-primary/10"
              />
              <polyline
                points={plotPath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((point) => (
                <circle
                  key={point.date}
                  cx={point.x * 6}
                  cy={point.y * 2.4}
                  r="3"
                  tabIndex={0}
                  role="img"
                  aria-label={`${dateLabel(point.date)}: ${point.value}`}
                  onFocus={() => setActiveDate(point.date)}
                  onBlur={() => setActiveDate(null)}
                  onMouseEnter={() => setActiveDate(point.date)}
                  onMouseLeave={() => setActiveDate(null)}
                  className="fill-primary outline-none focus:stroke-foreground"
                  strokeWidth="1"
                >
                  <title>
                    {dateLabel(point.date)}: {point.value}
                  </title>
                </circle>
              ))}
            </svg>
          ) : (
            <div className="relative flex h-52 items-end gap-1">
              {series.map((point) => (
                <button
                  key={point.date}
                  type="button"
                  style={{
                    height: `${Math.max(2, (point.value / max) * 100)}%`,
                  }}
                  aria-label={`${dateLabel(point.date)}: ${point.value}`}
                  title={`${dateLabel(point.date)}: ${point.value}`}
                  onFocus={() => setActiveDate(point.date)}
                  onBlur={() => setActiveDate(null)}
                  onMouseEnter={() => setActiveDate(point.date)}
                  onMouseLeave={() => setActiveDate(null)}
                  className="min-w-0 flex-1 origin-bottom rounded-t bg-primary/70 transition-colors hover:bg-primary focus:bg-primary focus-visible:ring-2 focus-visible:ring-ring motion-safe:animate-[admin-bar-in_200ms_ease-out]"
                />
              ))}
            </div>
          )}
          {series.length > 0 && (
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{dateLabel(series[0].date)}</span>
              <span>{dateLabel(series[series.length - 1].date)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
