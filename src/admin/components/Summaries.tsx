import { Link } from "react-router";
import { Avatar } from "@/ui/Avatar";
import TweetContent from "@/components/tweet/TweetContent";
import { APP_ROUTES } from "@/constants/routes";
import {
  REPORT_DECISIONS,
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGETS,
} from "@/constants/report";
import { formatCount, formatDateTime } from "@/utils/format";

import type { User } from "@/types/user";
import type { ReportSignal } from "@/types/report";

export function UserSummary({ user }: { user: User }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        userId={user.id}
        name={user.displayName}
        fallbackName={user.username}
        src={user.avatarUrl}
      />
      <div className="min-w-0">
        <Link
          to={APP_ROUTES.adminUser(user.id)}
          className="block truncate font-bold hover:underline"
        >
          {user.displayName || user.username}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          @{user.username} · {user.isBlocked ? "Заблоковано" : "Активний"}
        </p>
      </div>
    </div>
  );
}
export function ReportSummary({ report }: { report: ReportSignal }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={APP_ROUTES.adminReport(report.id)}
          className="font-semibold hover:underline"
        >
          {REPORT_TARGETS[report.targetType]} · {REPORT_REASONS[report.reason]}
        </Link>
        <span className="rounded-full bg-muted px-3 py-1 text-xs">
          {REPORT_STATUSES[report.status]}
          {report.decision ? ` · ${REPORT_DECISIONS[report.decision]}` : ""}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {report.source === "system"
          ? report.system?.label || "Системний сигнал"
          : `Скарга від @${report.reporter?.username ?? "невідомий"}`}{" "}
        · {formatDateTime(report.createdAt)}
      </p>
    </div>
  );
}
export function ReportPreview({ report }: { report: ReportSignal }) {
  const target = report.target;
  if (!target)
    return (
      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        Об’єкт видалено або він більше недоступний.
      </p>
    );
  if (target.type === "users")
    return (
      <div className="space-y-3">
        <UserSummary user={target.data} />
        <p className="whitespace-pre-wrap text-sm">{target.data.bio}</p>
        <p className="text-sm text-muted-foreground">
          {formatCount(target.data.followersCount)} читачів ·{" "}
          {formatCount(target.data.postsCount)} дописів
        </p>
        <Link
          className="text-sm text-primary hover:underline"
          to={APP_ROUTES.profile(target.data.username)}
        >
          Відкрити профіль
        </Link>
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar
          userId={target.data.author.id}
          name={target.data.author.displayName}
          fallbackName={target.data.author.username}
          src={target.data.author.avatarUrl}
        />
        <Link
          to={APP_ROUTES.profile(target.data.author.username)}
          className="font-semibold hover:underline"
        >
          @{target.data.author.username}
        </Link>
      </div>
      <TweetContent tweet={target.data} />
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
