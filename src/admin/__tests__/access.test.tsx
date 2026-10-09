import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminRoute from "@/admin/AdminRoute";
import ProtectedRoute from "@/components/routeGuards/ProtectedRoute";
import type { User } from "@/types/user";

const state = vi.hoisted(() => ({
  user: null as User | null,
  isLoading: false,
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ ...state, isAuthenticated: Boolean(state.user) }),
}));
vi.mock("react-router", () => ({
  Navigate: ({ to, state }: { to: string; state?: unknown }) => (
    <p>
      {to}
      {JSON.stringify(state)}
    </p>
  ),
  Outlet: () => <p>allowed</p>,
  useLocation: () => ({ pathname: "/admin" }),
}));
const user: User = {
  id: "u1",
  username: "viewer",
  isVerified: false,
  isFollowedByCurrentUser: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  createdAt: "2026-01-01",
};
beforeEach(() => {
  state.user = null;
  state.isLoading = false;
});
describe("administrative route access", () => {
  it("redirects guests to login while preserving their requested URL", () => {
    expect(renderToStaticMarkup(<ProtectedRoute />)).toContain("/login");
    expect(renderToStaticMarkup(<ProtectedRoute />)).toContain("/admin");
  });
  it("waits for session initialization rather than redirecting", () => {
    state.isLoading = true;
    expect(renderToStaticMarkup(<ProtectedRoute />)).not.toContain("/login");
  });
  it.each([undefined, "User", "unknown"])("denies role %s", (role) => {
    state.user = { ...user, role: role as User["role"] };
    expect(renderToStaticMarkup(<AdminRoute />)).toContain("/home");
  });
  it("allows an administrator and denies a blocked administrator", () => {
    state.user = { ...user, role: "Admin" };
    expect(renderToStaticMarkup(<AdminRoute />)).toContain("allowed");
    state.user.isBlocked = true;
    expect(renderToStaticMarkup(<AdminRoute />)).toContain("/home");
  });
});
