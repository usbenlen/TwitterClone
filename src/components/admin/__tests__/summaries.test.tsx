import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DashboardReportSummary,
  ReportPreview,
  ReportSummary,
} from "@/components/admin/Summaries";
import { ReportActions } from "@/components/admin/ReportActions";

import type { ReportSignal } from "@/types/report";
import type { Post } from "@/types/post";
import type { DashboardTables } from "@/types/admin";

import { formatDateTime } from "@/utils/format";

const content = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("@/components/posts/PostContent", () => ({
  default: ({ post }: { post: Post }) => {
    content.render(post);
    return <p>{post.content}</p>;
  },
}));

const post: Post = {
  id: "post-1",
  versionId: "version-1",
  content: "Long reported material. ".repeat(300),
  author: { id: "author-id", username: "author", isVerified: false },
  attachments: [],
  likesCount: 1,
  repliesCount: 2,
  retweetsCount: 0,
  viewsCount: 3,
  likedByMe: false,
  repostedByMe: false,
  bookmarkedByMe: false,
  createdAt: "2026-10-01T12:00:00Z",
};

const report: ReportSignal = {
  id: "report-1",
  targetType: "posts",
  targetId: post.id,
  target: { type: "posts", data: post },
  source: "user",
  reporter: { id: "reporter-id", username: "reporter" },
  status: "pending",
  reason: "spam",
  createdAt: "2026-10-01T12:05:00Z",
};

function renderReport(value: ReportSignal, compact = false) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ReportSummary report={value} compact={compact} />
      <ReportPreview report={value} compact={compact} />
    </MemoryRouter>,
  );
}

beforeEach(() => content.render.mockClear());

describe("dashboard report groups", () => {
  const row: DashboardTables["latestReports"][number] = {
    targetType: "posts",
    targetId: "post/1&2",
    count: 3,
    latestSignal: "2026-10-09T10:00:00Z",
    target: { type: "posts", data: post },
  };

  function renderGroup(value = row) {
    return renderToStaticMarkup(
      <MemoryRouter>
        <DashboardReportSummary row={value} />
      </MemoryRouter>,
    );
  }

  it.each(["posts", "comments"] as const)(
    "shows a %s target's author, count and timestamp",
    (type) => {
      const html = renderGroup({
        ...row,
        targetType: type,
        target: { type, data: post },
      });
      expect(html).toContain("@author");
      expect(html).toContain("Скарг на об’єкт: 3");
      expect(html).toContain(`dateTime="${row.latestSignal}"`);
      expect(html).toContain(formatDateTime(row.latestSignal));
      expect(html).toContain(
        `/admin/moderation?type=${type}&amp;search=post%2F1%262`,
      );
      expect(html).not.toContain("невідомий");
      expect(html).not.toContain("Дата невідома");
      expect(html).not.toContain("На перевірці");
      expect(content.render).not.toHaveBeenCalled();
    },
  );

  it("shows the reported account for a user target", () => {
    const html = renderGroup({
      ...row,
      targetType: "users",
      target: {
        type: "users",
        data: {
          ...post.author,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isFollowedByCurrentUser: false,
          createdAt: post.createdAt,
        },
      },
    });
    expect(html).toContain("Користувачі");
    expect(html).toContain("@author");
    expect(html).toContain("type=users&amp;search=post%2F1%262");
  });

  it("preserves the count, date and moderation link when a target has been removed", () => {
    const html = renderGroup({ ...row, target: null });
    expect(html).toContain("Об’єкт недоступний");
    expect(html).toContain("Скарг на об’єкт: 3");
    expect(html).toContain(formatDateTime(row.latestSignal));
    expect(html).toContain("search=post%2F1%262");
    expect(html).not.toContain("@author");
  });
});

describe("moderation report presentation", () => {
  it.each(["posts", "comments"] as const)(
    "keeps a %s report compact without mounting its content",
    (type) => {
      const html = renderReport(
        {
          ...report,
          targetType: type,
          target: { type, data: { ...post, isComment: type === "comments" } },
        },
        true,
      );

      expect(content.render).not.toHaveBeenCalled();
      expect(html).not.toContain(post.content);
      expect(html).toContain(type === "comments" ? "коментар" : "допис");
      expect(html.indexOf("@reporter")).toBeLessThan(html.indexOf("@author"));
      expect(html.indexOf("@author")).toBeLessThan(html.indexOf("<time"));
      expect(html).toContain('href="/admin/moderation/report-1"');
      expect(html).toContain("Спам");
      expect(html).toContain("На перевірці");
    },
  );

  it("shows the complete material in the default detail presentation", () => {
    expect(renderReport(report)).toContain(post.content);
    expect(content.render).toHaveBeenCalledWith(post);
  });

  it("keeps direct navigation available for a resolved report without moderation actions", () => {
    const resolved: ReportSignal = {
      ...report,
      status: "resolved",
      decision: "kept",
    };
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ReportActions
          report={resolved}
          busy={false}
          onAction={vi.fn()}
          leading={<ReportPreview report={resolved} compact />}
        />
      </MemoryRouter>,
    );
    expect(html).toContain("Відкрити");
    expect(html).not.toContain("Залишити");
    expect(html).not.toContain("Видалити");
  });

  it("preserves the account preview even when compact mode is requested", () => {
    const html = renderReport(
      {
        ...report,
        targetType: "users",
        targetId: "author-id",
        target: {
          type: "users",
          data: {
            ...post.author,
            bio: "Account biography",
            isFollowedByCurrentUser: false,
            followersCount: 10,
            followingCount: 5,
            postsCount: 3,
            createdAt: post.createdAt,
          },
        },
      },
      true,
    );
    expect(html).toContain("Account biography");
    expect(html).toContain('href="/admin/users/author-id"');
    expect(html).toContain('href="/author"');
  });

  it("describes a missing target without offering to open it", () => {
    const html = renderReport({ ...report, target: null }, true);
    expect(html).toContain("Допис недоступний");
    expect(html).not.toContain("Відкрити");
    expect(content.render).not.toHaveBeenCalled();
  });

  it("handles a system signal and an unknown reporter", () => {
    const system = renderReport(
      {
        ...report,
        source: "system",
        system: { code: "spam", label: "Автоматична перевірка" },
      },
      true,
    );
    expect(system).toContain("Автоматична перевірка");
    expect(system).not.toContain("@reporter");
    expect(renderReport({ ...report, reporter: undefined }, true)).toContain(
      "Невідомий користувач",
    );
  });

  it("renders an unavailable report date without crashing", () => {
    expect(renderReport({ ...report, createdAt: "" })).toContain(
      "Дата невідома",
    );
  });
});
