import { ApiError } from "@/api/client";

import { ADMIN_PAGE_SIZE } from "@/admin/constants";

import type {
  AdminUser,
  AnalyticsPeriod,
  DashboardAnalytics,
  DashboardMetric,
  DashboardTables,
  ModerationParams,
  Paginated,
  UserAction,
  UsersParams,
} from "@/admin/types";

import type {
  CreateReportRequest,
  ReportDecision,
  ReportSignal,
  ReportTarget,
  ReportTargetType,
} from "@/types/report";

import { REPORT_REASONS } from "@/constants/report";

import { currentUser, sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { commentsByPostId } from "@/mock/data/comments";
import { mockFollowers, mockFollowing } from "@/mock/data/follow";
import { MOCK_DELAYS } from "@/mock/constants";
import { delay } from "@/mock/utils/delay";
import { removeMockContent } from "@/mock/utils/removeMockContent";

type StoredReport = Omit<ReportSignal, "target">;

export const moderationSignals: StoredReport[] = [];

const missing = () => new ApiError(404, "Об’єкт не знайдено.");

function assertAdmin() {
  if (currentUser.role !== "Admin" || currentUser.isBlocked)
    throw new ApiError(403, "Доступ лише для адміністратора.");
}

function targetFor(type: ReportTargetType, id: string): ReportTarget | null {
  if (type === "users") {
    const data = sampleAuthors.find((user) => user.id === id);
    return data ? { type, data } : null;
  }
  const data = (
    type === "posts" ? tweets : Object.values(commentsByPostId).flat()
  ).find((item) => item.id === id);
  return data ? { type, data } : null;
}

function hydrate(report: StoredReport): ReportSignal {
  return structuredClone({
    ...report,
    target: targetFor(report.targetType, report.targetId),
  });
}

function adminUser(user: (typeof sampleAuthors)[number]): AdminUser {
  return { ...structuredClone(user), isBlocked: user.isBlocked ?? false };
}

export function paginate<T>(
  items: T[],
  requestedPage: number,
  limit = ADMIN_PAGE_SIZE,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1),
  );
  return {
    items: structuredClone(items.slice((page - 1) * limit, page * limit)),
    pagination: { page, total: items.length, totalPages },
  };
}

function ordered<T extends { createdAt: string }>(
  items: T[],
  sort: "newest" | "oldest",
) {
  return [...items].sort(
    (a, b) =>
      (Date.parse(a.createdAt) - Date.parse(b.createdAt)) *
      (sort === "oldest" ? 1 : -1),
  );
}

function changeUser(id: string, action: UserAction) {
  if (id === currentUser.id) throw new ApiError(400, "Керуйте власним акаунтом у налаштуваннях.");

  const user = sampleAuthors.find((item) => item.id === id);
  if (!user) throw missing();

  if (action !== "delete") {
    user.isBlocked = action === "block";
    return;
  }

  for (const post of [...tweets])
    if (post.author.id === id) removeMockContent("post", post.id);

  for (const comment of Object.values(commentsByPostId).flat()) {
    if (comment.author.id === id && targetFor("comments", comment.id))
      removeMockContent("comment", comment.id);
  }
  sampleAuthors.splice(sampleAuthors.indexOf(user), 1);
  for (const collection of [mockFollowers, mockFollowing]) {
    delete collection[id];
    for (const key of Object.keys(collection))
      collection[key] = collection[key].filter((item) => item.id !== id);
  }
}

export const mockAdminApi = {
  async users(params: UsersParams) {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const search = params.search.trim().toLocaleLowerCase();

    return paginate(
      ordered(
        sampleAuthors.filter(
          (user) =>
            `${user.username} ${user.displayName ?? ""} ${user.email ?? ""}`
              .toLocaleLowerCase()
              .includes(search) &&
            (params.status === "all" ||
              Boolean(user.isBlocked) === (params.status === "blocked")),
        ),
        params.sort,
      ).map(adminUser),
      params.page,
    );
  },

  async user(id: string) {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const user = sampleAuthors.find((item) => item.id === id);
    if (!user) throw missing();

    return adminUser(user);
  },

  async actOnUser(id: string, action: UserAction) {
    await delay(MOCK_DELAYS.WRITE);

    assertAdmin();

    changeUser(id, action);
  },

  async reports(params: ModerationParams) {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const search = params.search.trim().toLocaleLowerCase();
    const matches = moderationSignals.filter((report) => {
      const target = targetFor(report.targetType, report.targetId);
      const text = `${report.targetId} ${report.reporter?.username ?? ""} ${REPORT_REASONS[report.reason]} ${target ? (target.type === "users" ? `${target.data.username} ${target.data.displayName ?? ""}` : `${target.data.content} ${target.data.author.username}`) : ""}`;
      return (
        text.toLocaleLowerCase().includes(search) &&
        (params.type === "all" || params.type === report.targetType) &&
        (params.source === "all" || params.source === report.source) &&
        (params.status === "all" || params.status === report.status) &&
        (params.decision === "all" || params.decision === report.decision)
      );
    });

    return paginate(ordered(matches, params.sort).map(hydrate), params.page);
  },

  async report(id: string) {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const report = moderationSignals.find((item) => item.id === id);
    if (!report) throw missing();

    return hydrate(report);
  },

  async resolveReport(id: string, decision: ReportDecision) {
    await delay(MOCK_DELAYS.WRITE);

    assertAdmin();

    const report = moderationSignals.find((item) => item.id === id);
    if (!report) throw missing();
    if (report.status === "resolved") {
      if (report.decision !== decision)
        throw new ApiError(409, "Скаргу вже розглянуто з іншим рішенням.");
      return hydrate(report);
    }

    if (decision === "blocked" && report.targetType !== "users")
      throw new ApiError(400, "Блокування доступне лише для користувачів.");

    const target = targetFor(report.targetType, report.targetId);
    const alreadyDeleted =
      decision === "deleted" &&
      moderationSignals.some(
        (item) =>
          item.targetType === report.targetType &&
          item.targetId === report.targetId &&
          item.decision === "deleted",
      );
    if (!target && decision !== "kept" && !alreadyDeleted) throw missing();
    // No await between the action and the audit update: a mock operation is atomic.
    if (decision === "blocked") changeUser(report.targetId, "block");
    if (decision === "deleted" && target) {
      if (report.targetType === "users") changeUser(report.targetId, "delete");
      else
        removeMockContent(
          report.targetType === "posts" ? "post" : "comment",
          report.targetId,
        );
    }
    report.status = "resolved";
    report.decision = decision;
    report.resolvedAt = new Date().toISOString();
    report.resolvedBy = { id: currentUser.id, username: currentUser.username };
    return hydrate(report);
  },
  async createReport(data: CreateReportRequest): Promise<void> {
    await delay(MOCK_DELAYS.WRITE);

    if (currentUser.isBlocked) throw new ApiError(403, "Акаунт заблоковано.");
    if (!Object.hasOwn(REPORT_REASONS, data.reason)) throw new ApiError(400, "Оберіть причину скарги.");

    const target = targetFor(data.targetType, data.targetId);
    if (!target) throw missing();

    const owner = target.type === "users" ? target.data.id : target.data.author.id;
    if (owner === currentUser.id) throw new ApiError(400, "Не можна скаржитися на власний матеріал.");

    moderationSignals.push({
      ...data,
      id: crypto.randomUUID(),
      source: "user",
      status: "pending",
      createdAt: new Date().toISOString(),
      reporter: { id: currentUser.id, username: currentUser.username },
    });
  },

  async metrics(): Promise<DashboardMetric[]> {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    return [
      { id: "users", title: "Користувачі", value: sampleAuthors.length },
      { id: "posts", title: "Дописи", value: tweets.length },
      {
        id: "comments",
        title: "Коментарі",
        value: Object.values(commentsByPostId).flat().length,
      },
      {
        id: "reports",
        title: "На перевірці",
        value: moderationSignals.filter((report) => report.status === "pending")
          .length,
      },
    ];
  },

  async analytics(period: AnalyticsPeriod): Promise<DashboardAnalytics> {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const points = (days: number, dates: string[], cumulative = false) =>
      Array.from({ length: days }, (_, index) => {
        const day = new Date();
        day.setUTCHours(0, 0, 0, 0);
        day.setUTCDate(day.getUTCDate() - days + index + 1);
        const date = day.toISOString().slice(0, 10);
        return {
          date,
          value: dates.filter((value) =>
            cumulative
              ? value.slice(0, 10) <= date
              : value.slice(0, 10) === date,
          ).length,
        };
      });

    const build = (days: number) => ({
      posts: points(
        days,
        tweets.map((item) => item.createdAt),
      ),
      comments: points(
        days,
        Object.values(commentsByPostId)
          .flat()
          .map((item) => item.createdAt),
      ),
    });

    void period;

    return {
      audience: {
        "7d": points(
          7,
          sampleAuthors.map((item) => item.createdAt),
          true,
        ),
        "30d": points(
          30,
          sampleAuthors.map((item) => item.createdAt),
          true,
        ),
      },
      activity: { "7d": build(7), "30d": build(30) },
    };
  },

  async tables(limit: number): Promise<DashboardTables> {
    await delay(MOCK_DELAYS.READ);

    assertAdmin();

    const grouped = new Map<string, DashboardTables["latestReports"][number]>();

    for (const report of ordered(moderationSignals, "newest")) {
      const key = `${report.targetType}:${report.targetId}`;

      const previous = grouped.get(key);
      if (previous) previous.count += 1;
      else
        grouped.set(key, {
          targetType: report.targetType,
          targetId: report.targetId,
          count: 1,
          latestSignal: hydrate(report),
          target: targetFor(report.targetType, report.targetId),
        });
    }

    return structuredClone({
      latestUsers: ordered(sampleAuthors, "newest")
        .slice(0, limit)
        .map(adminUser),
      latestReports: [...grouped.values()].slice(0, limit),
    });
  },
};

// Seed one user signal and one system signal from actual shared entities.
for (const [index, post] of tweets
  .filter((item) => item.author.id !== currentUser.id)
  .slice(0, 2)
  .entries()) {
  moderationSignals.push({
    id: `seed-report-${index}`,
    targetType: "posts",
    targetId: post.id,
    source: index === 0 ? "user" : "system",
    status: "pending",
    reason: "spam",
    createdAt: new Date().toISOString(),
    ...(index === 0
      ? { reporter: { id: currentUser.id, username: currentUser.username } }
      : { system: { code: "demo", label: "Демонстраційний сигнал" } }),
  });
}
