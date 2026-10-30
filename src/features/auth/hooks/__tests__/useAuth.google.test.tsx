// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore } from "@/app/store/store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authCleared, authReady } from "@/features/auth/model/authState";
import { tokenStorage } from "@/shared/lib/tokenStorage";
import { sessionChanged } from "@/shared/store/session";

import type { Root } from "react-dom/client";
import type { AppStore } from "@/app/store/store";
import type { AuthResponse } from "@/features/auth/types/auth";
import type { User } from "@/features/profiles/types/user";

const api = vi.hoisted(() => ({
  loginWithGoogle: vi.fn(),
  linkGoogle: vi.fn(),
  me: vi.fn(),
}));
vi.mock("@/features/auth/api/authApi", () => ({ authApi: api }));

const tokens: AuthResponse = {
  userId: "u1",
  username: "google-user",
  accessToken: "google-access",
  refreshToken: "google-refresh",
};
const user: User = {
  id: "u1",
  username: "google-user",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isVerified: true,
  isFollowedByCurrentUser: false,
  createdAt: "2026-10-12T00:00:00Z",
};
let root: Root;
let host: HTMLDivElement;
let store: AppStore;

function mount() {
  let result!: ReturnType<typeof useAuth>;
  function Probe() {
    result = useAuth();
    return null;
  }
  store = createAppStore();
  store.dispatch(authCleared());
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <Provider store={store}>
        <Probe />
      </Provider>,
    ),
  );
  return () => result;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  api.loginWithGoogle.mockReset().mockResolvedValue(tokens);
  api.linkGoogle.mockReset().mockResolvedValue(undefined);
  api.me.mockReset().mockResolvedValue(user);
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Google session lifecycle", () => {
  it("preserves tokens written by another tab during the exchange", async () => {
    const pending = deferred<AuthResponse>();
    api.loginWithGoogle.mockReturnValue(pending.promise);
    const read = mount();
    const result = read().loginWithGoogle({ idToken: "id-token" });
    tokenStorage.setTokens("other-access", "other-refresh");
    pending.resolve(tokens);
    expect(await result).toBe(false);
    expect(tokenStorage.getAccessToken()).toBe("other-access");
    expect(api.me).not.toHaveBeenCalled();
  });
  it("stores server tokens, fetches /me and authenticates the returned user", async () => {
    const read = mount();
    await act(async () => {
      expect(await read().loginWithGoogle({ idToken: "id-token" })).toBe(true);
    });
    expect(store.getState().auth.user).toEqual(user);
    expect(store.getState().session.generation).toBe(1);
    expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
    expect(tokenStorage.getRefreshToken()).toBe(tokens.refreshToken);
    expect(api.me).toHaveBeenCalledTimes(1);
  });

  it("clears a partially established session and reports a /me failure", async () => {
    const read = mount();
    api.me.mockRejectedValue(new Error("profile unavailable"));
    await act(async () => {
      await expect(
        read().loginWithGoogle({ idToken: "id-token" }),
      ).rejects.toThrow("profile unavailable");
    });
    expect(tokenStorage.hasTokens()).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it("ignores an exchange that completes after another session starts", async () => {
    const pending = deferred<AuthResponse>();
    api.loginWithGoogle.mockReturnValue(pending.promise);
    const read = mount();
    const result = read().loginWithGoogle({ idToken: "id-token" });
    act(() => {
      store.dispatch(sessionChanged());
      store.dispatch(authReady({ ...user, id: "u2" }));
      tokenStorage.setTokens("new-access", "new-refresh");
    });
    await act(async () => {
      pending.resolve(tokens);
      expect(await result).toBe(false);
    });
    expect(store.getState().auth.user?.id).toBe("u2");
    expect(tokenStorage.getAccessToken()).toBe("new-access");
    expect(api.me).not.toHaveBeenCalled();
  });

  it("ignores a /me response after logout without restoring tokens or user", async () => {
    const pending = deferred<User>();
    api.me.mockReturnValue(pending.promise);
    const read = mount();
    let result!: Promise<boolean>;
    await act(async () => {
      result = read().loginWithGoogle({ idToken: "id-token" });
    });
    act(() => {
      tokenStorage.clear();
      store.dispatch(sessionChanged());
      store.dispatch(authCleared());
    });
    await act(async () => {
      pending.resolve(user);
      expect(await result).toBe(false);
    });
    expect(tokenStorage.hasTokens()).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it("ignores a cancelled exchange even when the adapter completes", async () => {
    const pending = deferred<AuthResponse>();
    api.loginWithGoogle.mockReturnValue(pending.promise);
    const read = mount();
    const controller = new AbortController();
    const result = read().loginWithGoogle(
      { idToken: "id-token" },
      controller.signal,
    );
    controller.abort();
    pending.resolve(tokens);
    expect(await result).toBe(false);
    expect(tokenStorage.hasTokens()).toBe(false);
    expect(api.me).not.toHaveBeenCalled();
  });

  it("links without changing the current session or tokens", async () => {
    const read = mount();
    act(() => store.dispatch(authReady(user)));
    tokenStorage.setTokens("current-access", "current-refresh");
    expect(await read().linkGoogle({ idToken: "id-token" })).toBe(true);
    expect(store.getState().session.generation).toBe(0);
    expect(tokenStorage.getAccessToken()).toBe("current-access");
    expect(api.me).not.toHaveBeenCalled();
  });

  it("suppresses a link result after the current account changes", async () => {
    const pending = deferred<void>();
    api.linkGoogle.mockReturnValue(pending.promise);
    const read = mount();
    act(() => store.dispatch(authReady(user)));
    const result = read().linkGoogle({ idToken: "id-token" });
    act(() => store.dispatch(sessionChanged()));
    pending.resolve(undefined);
    expect(await result).toBe(false);
  });
});
