import { describe, expect, it } from "vitest";
import { readListParams } from "@/admin/listState";
import { USERS_DEFAULTS } from "@/admin/constants";
import { listQuery } from "@/admin/api";
import { activitySeries, chartGeometry } from "@/admin/analytics";
import { readMockUserRole } from "@/config/env";
import type { DashboardAnalytics } from "@/admin/types";

describe("admin list contracts", () => {
  it.each(["-1", "0", "1.5", "Infinity", "NaN", "9007199254740992"])(
    "normalizes invalid page %s",
    (page) => {
      expect(
        readListParams(
          new URLSearchParams({ page, status: "unknown", sort: "unknown" }),
          USERS_DEFAULTS,
          { status: ["all", "active", "blocked"], sort: ["newest", "oldest"] },
        ),
      ).toEqual(USERS_DEFAULTS);
    },
  );
  it("preserves valid URL filters and serializes escaped search text", () => {
    const input = readListParams(
      new URLSearchParams("page=2&search=A%26B&status=blocked&sort=oldest"),
      USERS_DEFAULTS,
      { status: ["blocked"], sort: ["oldest"] },
    );
    expect(input).toEqual({
      page: 2,
      search: "A&B",
      status: "blocked",
      sort: "oldest",
    });
    expect(new URLSearchParams(listQuery(input)).get("search")).toBe("A&B");
    expect(new URLSearchParams(listQuery(USERS_DEFAULTS)).has("status")).toBe(
      false,
    );
  });
  it("maps mock roles to the backend role format and rejects unrecognized roles", () => {
    expect(readMockUserRole({})).toBe("User");
    expect(readMockUserRole({ VITE_MOCK_USER_ROLE: "ADMIN" })).toBe("Admin");
    expect(() => readMockUserRole({ VITE_MOCK_USER_ROLE: "admin" })).toThrow();
  });
});
describe("dashboard calculations", () => {
  it("combines activity by date rather than array position", () => {
    const points = {
      posts: [{ date: "2026-10-01", value: 2 }],
      comments: [
        { date: "2026-09-30", value: 3 },
        { date: "2026-10-01", value: 4 },
      ],
    };
    const data: DashboardAnalytics = {
      audience: { "7d": [], "30d": [] },
      activity: { "7d": points, "30d": points },
    };
    expect(activitySeries(data, "7d", "all")).toEqual([
      { date: "2026-09-30", value: 3 },
      { date: "2026-10-01", value: 6 },
    ]);
  });
  it("keeps empty, zero and single-point charts finite", () => {
    expect(chartGeometry([])).toMatchObject({ max: 1, total: 0, path: "" });
    expect(chartGeometry([{ date: "2026-10-01", value: 0 }]).points).toEqual([
      { date: "2026-10-01", value: 0, x: 50, y: 100 },
    ]);
  });
});
