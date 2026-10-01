import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAdminApi,
  moderationSignals,
  paginate,
} from "@/mock/handlers/admin/mockAdminApi";
import { currentUser, sampleAuthors } from "@/mock/data/users";
import { tweets, setTweets } from "@/mock/data/tweets";
import { commentsByPostId } from "@/mock/data/comments";
import { mockFollowers, mockFollowing } from "@/mock/data/follow";
import { MODERATION_DEFAULTS, USERS_DEFAULTS } from "@/admin/constants";
import { createAppStore } from "@/store";
import { adminQueries } from "@/admin/store";
import { reportsApi } from "@/store/reportsApi";
import { postsApi } from "@/store/postsApi";
import { appApi } from "@/store/api";
import { sessionChanged } from "@/store/session";
import type { User } from "@/types/user";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
const initial = structuredClone({
  users: sampleAuthors,
  tweets,
  comments: commentsByPostId,
  reports: moderationSignals,
  followers: mockFollowers,
  following: mockFollowing,
});
function reset() {
  Object.assign(currentUser, initial.users[0]);
  currentUser.role = "ADMIN";
  currentUser.isBlocked = false;
  sampleAuthors.splice(
    0,
    sampleAuthors.length,
    currentUser,
    ...structuredClone(initial.users.slice(1)),
  );
  setTweets(structuredClone(initial.tweets));
  for (const [object, saved] of [
    [commentsByPostId, initial.comments],
    [mockFollowers, initial.followers],
    [mockFollowing, initial.following],
  ] as const) {
    for (const key of Object.keys(object)) delete object[key];
    Object.assign(object, structuredClone(saved));
  }
  moderationSignals.splice(
    0,
    moderationSignals.length,
    ...structuredClone(initial.reports),
  );
}
beforeEach(reset);
afterEach(reset);
async function reportUser() {
  const user = sampleAuthors[1];
  await mockAdminApi.createReport({
    targetType: "users",
    targetId: user.id,
    reason: "harassment",
  });
  return { user, report: moderationSignals.at(-1)! };
}
describe("shared mock moderation", () => {
  it.each(["block", "unblock", "delete"] as const)(
    "rejects %s on the acting administrator's account",
    async (action) => {
      await expect(
        mockAdminApi.actOnUser(currentUser.id, action),
      ).rejects.toMatchObject({ status: 400 });
      expect(currentUser.isBlocked).toBe(false);
      expect(sampleAuthors).toContain(currentUser);
    },
  );
  it.each(["USER", undefined] as const)(
    "denies administrative access for role %s",
    async (role) => {
      currentUser.role = role;
      await expect(mockAdminApi.users(USERS_DEFAULTS)).rejects.toMatchObject({
        status: 403,
      });
    },
  );
  it("submits a report into the queue and exposes the shared target", async () => {
    const { user, report } = await reportUser();
    const result = await mockAdminApi.reports({
      ...MODERATION_DEFAULTS,
      type: "users",
      status: "pending",
    });
    expect(result.items).toContainEqual(
      expect.objectContaining({
        id: report.id,
        reporter: { id: currentUser.id, username: currentUser.username },
        target: {
          type: "users",
          data: expect.objectContaining({ id: user.id }),
        },
      }),
    );
  });
  it("rejects reports of own content and invalid reasons", async () => {
    await expect(
      mockAdminApi.createReport({
        targetType: "users",
        targetId: currentUser.id,
        reason: "spam",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      mockAdminApi.createReport({
        targetType: "users",
        targetId: "absent",
        reason: "spam",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
  it("actually blocks the reported user and stores the resolution", async () => {
    const { user, report } = await reportUser();
    const result = await mockAdminApi.resolveReport(report.id, "blocked");
    expect(user.isBlocked).toBe(true);
    expect(result).toMatchObject({
      status: "resolved",
      decision: "blocked",
      resolvedBy: { id: currentUser.id },
    });
    expect(result.resolvedAt).toBeTruthy();
    await mockAdminApi.actOnUser(user.id, "unblock");
    expect((await mockAdminApi.user(user.id)).isBlocked).toBe(false);
  });
  it("keeps content intact and prevents contradictory repeat decisions", async () => {
    const { user, report } = await reportUser();
    await mockAdminApi.resolveReport(report.id, "kept");
    await expect(
      mockAdminApi.resolveReport(report.id, "kept"),
    ).resolves.toMatchObject({ decision: "kept" });
    await expect(
      mockAdminApi.resolveReport(report.id, "deleted"),
    ).rejects.toMatchObject({ status: 409 });
    expect(sampleAuthors).toContain(user);
  });
  it("does not mark a report resolved when its action fails", async () => {
    const report = moderationSignals[0];
    await expect(
      mockAdminApi.resolveReport(report.id, "blocked"),
    ).rejects.toMatchObject({ status: 400 });
    expect(report.status).toBe("pending");
  });
  it("deletes shared posts and their comments while retaining report history", async () => {
    const report = moderationSignals[0];
    const postId = report.targetId;
    const result = await mockAdminApi.resolveReport(report.id, "deleted");
    expect(tweets.some((post) => post.id === postId)).toBe(false);
    expect(commentsByPostId[postId]).toBeUndefined();
    expect(result).toMatchObject({
      status: "resolved",
      decision: "deleted",
      target: null,
    });
    expect((await mockAdminApi.report(report.id)).target).toBeNull();
  });
  it("resolves multiple reports for an already deleted target", async () => {
    const first = moderationSignals[0];
    moderationSignals.push({ ...first, id: "second-report" });
    await mockAdminApi.resolveReport(first.id, "deleted");
    await expect(
      mockAdminApi.resolveReport("second-report", "deleted"),
    ).resolves.toMatchObject({ decision: "deleted", target: null });
  });
  it("removes nested comments and updates unavailable quotes", async () => {
    const template = Object.values(commentsByPostId).flat()[0];
    commentsByPostId.t1.push(
      {
        ...template,
        id: "parent",
        author: sampleAuthors[1],
        postId: "t1",
        parentCommentId: null,
      },
      { ...template, id: "child", postId: "t1", parentCommentId: "parent" },
      { ...template, id: "grandchild", postId: "t1", parentCommentId: "child" },
    );
    tweets.push({
      ...tweets[0],
      id: "quoted",
      quote: {
        targetType: "comment",
        targetId: "child",
        targetVersionId: template.versionId,
        hasNewVersion: false,
        replyingToUsernames: [],
        target: template,
      },
    });
    await mockAdminApi.createReport({
      targetType: "comments",
      targetId: "parent",
      reason: "spam",
    });
    await mockAdminApi.resolveReport(moderationSignals.at(-1)!.id, "deleted");
    expect(
      commentsByPostId.t1.some((item) =>
        ["parent", "child", "grandchild"].includes(item.id),
      ),
    ).toBe(false);
    expect(
      tweets.find((item) => item.id === "quoted")?.quote?.target,
    ).toBeNull();
  });
  it("removes deleted users from profiles, authored content and follow lists", async () => {
    const { user, report } = await reportUser();
    await mockAdminApi.resolveReport(report.id, "deleted");
    expect(sampleAuthors.some((item) => item.id === user.id)).toBe(false);
    expect(tweets.some((item) => item.author.id === user.id)).toBe(false);
    expect(
      Object.values(mockFollowing)
        .flat()
        .some((item) => item.id === user.id),
    ).toBe(false);
    await expect(mockAdminApi.user(user.id)).rejects.toMatchObject({
      status: 404,
    });
  });
  it("loads a user outside the first page and clamps pagination", async () => {
    const extra: User[] = Array.from({ length: 12 }, (_, index) => ({
      ...sampleAuthors[1],
      id: `extra-${index}`,
      username: `extra_${index}`,
      createdAt: "2020-01-01T00:00:00Z",
    }));
    sampleAuthors.push(...extra);
    expect(
      (await mockAdminApi.users(USERS_DEFAULTS)).items.some(
        (user) => user.id === "extra-11",
      ),
    ).toBe(false);
    expect((await mockAdminApi.user("extra-11")).username).toBe("extra_11");
    const page = await mockAdminApi.users({ ...USERS_DEFAULTS, page: 999 });
    expect(page.pagination.page).toBe(page.pagination.totalPages);
    expect(paginate([], -1).pagination).toEqual({
      page: 1,
      total: 0,
      totalPages: 1,
    });
  });
  it("filters and sorts on the server and returns independent snapshots", async () => {
    const user = sampleAuthors[1];
    user.isBlocked = true;
    const result = await mockAdminApi.users({
      ...USERS_DEFAULTS,
      search: user.username.toUpperCase(),
      status: "blocked",
    });
    expect(result.items).toHaveLength(1);
    result.items[0].username = "changed";
    expect(user.username).not.toBe("changed");
    const { report } = await reportUser();
    await mockAdminApi.resolveReport(report.id, "kept");
    expect(
      (
        await mockAdminApi.reports({
          ...MODERATION_DEFAULTS,
          decision: "kept",
          source: "user",
          type: "users",
        })
      ).items.map((item) => item.id),
    ).toEqual([report.id]);
  });
  it("updates dashboard counters, honors limits and anchors charts to today", async () => {
    const before = (await mockAdminApi.metrics()).find(
      (item) => item.id === "reports",
    )!.value!;
    await reportUser();
    expect(
      (await mockAdminApi.metrics()).find((item) => item.id === "reports")!
        .value,
    ).toBe(before + 1);
    expect((await mockAdminApi.tables(1)).latestUsers).toHaveLength(1);
    const analytics = await mockAdminApi.analytics("7d");
    expect(analytics.audience["7d"]).toHaveLength(7);
    expect(analytics.activity["30d"].posts).toHaveLength(30);
    expect(analytics.audience["7d"].at(-1)?.date).toBe(
      new Date().toISOString().slice(0, 10),
    );
  });
});
describe("administrative RTK Query integration", () => {
  it("refreshes reports and dashboard when a public report is submitted", async () => {
    const store = createAppStore();
    const metrics = store.dispatch(
      adminQueries.endpoints.adminMetrics.initiate(undefined),
    );
    const reports = store.dispatch(
      adminQueries.endpoints.adminReports.initiate(MODERATION_DEFAULTS),
    );
    await Promise.all([metrics, reports]);
    const before = reportsApi.endpoints.createReport;
    await store
      .dispatch(
        before.initiate({
          targetType: "users",
          targetId: sampleAuthors[1].id,
          reason: "spam",
        }),
      )
      .unwrap();
    await Promise.all(store.dispatch(appApi.util.getRunningQueriesThunk()));
    expect(
      adminQueries.endpoints.adminReports.select(MODERATION_DEFAULTS)(
        store.getState(),
      ).data?.pagination.total,
    ).toBe(initial.reports.length + 1);
    metrics.unsubscribe();
    reports.unsubscribe();
    store.dispatch(appApi.util.resetApiState());
  });
  it("removes moderated content from the public cache and clears admin state on logout", async () => {
    const store = createAppStore();
    const feed = store.dispatch(
      postsApi.endpoints.getPosts.initiate({ kind: "feed" }),
    );
    const report = moderationSignals[0];
    const detail = store.dispatch(
      adminQueries.endpoints.adminReport.initiate(report.id),
    );
    await Promise.all([feed, detail]);
    await store
      .dispatch(
        adminQueries.endpoints.resolveReport.initiate({
          id: report.id,
          decision: "deleted",
        }),
      )
      .unwrap();
    await Promise.all(store.dispatch(appApi.util.getRunningQueriesThunk()));
    expect(
      postsApi.endpoints.getPosts
        .select({ kind: "feed" })(store.getState())
        .data?.some((item) => item.id === report.targetId),
    ).toBe(false);
    expect(
      adminQueries.endpoints.adminReport.select(report.id)(store.getState())
        .data?.decision,
    ).toBe("deleted");
    store.dispatch(sessionChanged());
    expect(
      adminQueries.endpoints.adminReport.select(report.id)(store.getState())
        .isUninitialized,
    ).toBe(true);
    feed.unsubscribe();
    detail.unsubscribe();
    store.dispatch(appApi.util.resetApiState());
  });
});
