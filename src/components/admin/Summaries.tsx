import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Avatar, Button } from "@/components/ui";

import PostContent from "@/components/posts/PostContent";

import { APP_ROUTES } from "@/constants/routes";
import {
  REPORT_DECISIONS,
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGETS,
} from "@/constants/report";

import { formatCount, formatDateTime } from "@/utils/format";
import {
  normalizeDisplayText,
  normalizeInlineDisplayText,
} from "@/utils/displayText";

import type { User, ReportSignal, DashboardTables } from "@/types";

export function DashboardReportSummary({
  row,
}: {
  row: DashboardTables["latestReports"][number];
}) {
  const subject = row.target
    ? row.target.type === "users"
      ? row.target.data
      : row.target.data.author
    : null;

  return (
    <div className="min-w-0 space-y-2 py-3">
      <Link
        to={APP_ROUTES.adminModerationForTarget(row.targetType, row.targetId)}
        className="block overflow-hidden rounded-sm font-semibold wrap-anywhere hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {REPORT_TARGETS[row.targetType]}
        {subject && ` · @${normalizeInlineDisplayText(subject.username)}`}
      </Link>
      {!row.target && (
        <p className="text-sm text-muted-foreground">Об’єкт недоступний</p>
      )}
      <p className="text-sm text-muted-foreground">
        Остання скарга:{" "}
        <time dateTime={row.latestSignal}>
          {formatDateTime(row.latestSignal)}
        </time>
      </p>
      <p className="text-xs text-muted-foreground">
        Скарг на об’єкт: {formatCount(row.count)}
      </p>
    </div>
  );
}

export function UserSummary({
  user,
  linkName = true,
}: {
  user: User;
  linkName?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        userId={user.id}
        name={user.displayName}
        fallbackName={user.username}
        src={user.avatarUrl}
      />
      <div className="min-w-0">
        {linkName ? (
          <Link
            to={APP_ROUTES.adminUser(user.id)}
            className="block truncate rounded-sm font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {normalizeInlineDisplayText(user.displayName || user.username)}
          </Link>
        ) : (
          <p className="truncate font-bold">
            {normalizeInlineDisplayText(user.displayName || user.username)}
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
          <Link
            to={APP_ROUTES.profile(user.username)}
            className="min-w-0 truncate rounded-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            @{normalizeInlineDisplayText(user.username)}
          </Link>
          <span>{user.isBlocked ? "Заблоковано" : "Активний"}</span>
        </div>
      </div>
    </div>
  );
}
export function ReportSummary({
  report,
  compact = false,
}: {
  report: ReportSignal;
  compact?: boolean;
}) {
  const isCompact = compact && report.targetType !== "users";
  const author =
    report.target && report.target.type !== "users"
      ? report.target.data.author
      : null;

  return (
    <div className="space-y-2">
      {isCompact && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {report.source === "system" ? (
            <span
              className="min-w-0 max-w-full truncate font-medium"
              title={report.system?.label}
            >
              {report.system?.label || "Системний сигнал"}
            </span>
          ) : report.reporter?.username ? (
            <>
              <span className="text-muted-foreground">Від</span>
              <Link
                to={APP_ROUTES.profile(report.reporter.username)}
                className="min-w-0 max-w-full truncate rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                @{normalizeInlineDisplayText(report.reporter.username)}
              </Link>
            </>
          ) : (
            <span className="text-muted-foreground">Невідомий користувач</span>
          )}
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">На</span>
          {author ? (
            <Link
              to={APP_ROUTES.profile(author.username)}
              className="min-w-0 max-w-full truncate rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              @{normalizeInlineDisplayText(author.username)}
            </Link>
          ) : (
            <span className="text-muted-foreground">
              {report.targetType === "comments"
                ? "Коментар недоступний"
                : "Допис недоступний"}
            </span>
          )}
          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <time dateTime={report.createdAt} className="text-muted-foreground">
            {formatDateTime(report.createdAt)}
          </time>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={APP_ROUTES.adminReport(report.id)}
          className="min-w-0 rounded-sm font-semibold wrap-break-word hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {REPORT_TARGETS[report.targetType]} · {REPORT_REASONS[report.reason]}
        </Link>
        <span className="rounded-full bg-muted px-3 py-1 text-xs">
          {REPORT_STATUSES[report.status]}
          {report.decision ? ` · ${REPORT_DECISIONS[report.decision]}` : ""}
        </span>
      </div>
      {!isCompact && (
        <p className="overflow-hidden text-sm wrap-anywhere text-muted-foreground">
          {report.source === "system"
            ? report.system?.label || "Системний сигнал"
            : `Скарга від @${normalizeInlineDisplayText(report.reporter?.username ?? "невідомий")}`}{" "}
          · {formatDateTime(report.createdAt)}
        </p>
      )}
    </div>
  );
}
export function ReportPreview({
  report,
  compact = false,
}: {
  report: ReportSignal;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const target = report.target;
  if (compact && report.targetType !== "users") {
    if (!target || target.type === "users") return null;
    return (
      <Button
        type="button"
        variant="outline"
        size="comfortable"
        shape="rounded"
        onClick={() => navigate(APP_ROUTES.post(target.data.id))}
      >
        <ArrowUpRight className="size-4.5 shrink-0" aria-hidden="true" />
        Відкрити {target.type === "comments" ? "коментар" : "допис"}
      </Button>
    );
  }
  if (!target)
    return (
      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        Об’єкт видалено або він більше недоступний.
      </p>
    );
  if (target.type === "users")
    return (
      <div className="min-w-0 space-y-3 rounded-xl bg-muted/40 p-4">
        <UserSummary user={target.data} />
        <p className="min-w-0 overflow-hidden text-sm wrap-anywhere whitespace-pre-wrap">
          {normalizeDisplayText(target.data.bio ?? "")}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCount(target.data.followersCount)} читачів ·{" "}
          {formatCount(target.data.postsCount)} дописів
        </p>
      </div>
    );
  return (
    <div className="min-w-0 space-y-3 rounded-xl bg-muted/40 p-4">
      <div className="flex items-center gap-3">
        <Avatar
          userId={target.data.author.id}
          name={target.data.author.displayName}
          fallbackName={target.data.author.username}
          src={target.data.author.avatarUrl}
        />
        <Link
          to={APP_ROUTES.profile(target.data.author.username)}
          className="min-w-0 truncate rounded-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          @{normalizeInlineDisplayText(target.data.author.username)}
        </Link>
      </div>
      <PostContent post={target.data} />
      <p className="text-sm text-muted-foreground">
        {formatCount(target.data.likesCount)} вподобань ·{" "}
        {formatCount(target.data.repliesCount)} відповідей ·{" "}
        {formatCount(target.data.viewsCount)} переглядів
      </p>
      <Link
        to={APP_ROUTES.post(target.data.id)}
        className="text-sm text-primary hover:underline"
      >
        Відкрити {target.type === "comments" ? "коментар" : "допис"}
      </Link>
    </div>
  );
}
