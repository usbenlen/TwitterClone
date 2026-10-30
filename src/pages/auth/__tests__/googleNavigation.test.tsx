// @vitest-environment happy-dom
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/httpClient";
import { AccountConnections } from "@/components/auth/AccountConnections";
import GoogleCallbackPage from "@/pages/auth/GoogleCallbackPage";
import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import { authReady, authCleared } from "@/store/authState";
import { createAppStore, type AppStore } from "@/store/store";
import { sessionChanged } from "@/store/session";
import { APP_ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage";
import { createGoogleRedirectUrl } from "@/utils/googleRedirect";
import { tokenStorage } from "@/utils/tokenStorage";
import type { GoogleAuthMode, GoogleRedirectContext } from "@/types/auth";
import type { User } from "@/types/user";

const api = vi.hoisted(() => ({
  loginWithGoogle: vi.fn(),
  linkGoogle: vi.fn(),
  me: vi.fn(),
}));
vi.mock("@/api/authApi", () => ({ authApi: api }));
vi.mock("@/constants/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/constants/auth")>()),
  GOOGLE_CLIENT_ID: "test-client",
  GOOGLE_ID_TOKEN_MAX_LENGTH: 8192,
  GOOGLE_REDIRECT_MAX_AGE_MS: 900000,
}));
const user = { id: "u1", username: "user" } as User;
let root: Root | undefined;
let host: HTMLDivElement;
let store: AppStore;

function prepare(
  mode: GoogleAuthMode = "signin",
  returnTo?: string,
  failure?: string,
) {
  createGoogleRedirectUrl(mode, mode === "link" ? "u1" : undefined, returnTo);
  const context = JSON.parse(
    sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)!,
  ) as GoogleRedirectContext;
  const idToken = `header.${btoa(JSON.stringify({ nonce: context.nonce }))}.signature`;
  const parameters = new URLSearchParams({
    state: context.state,
    ...(failure ? { error: failure } : { id_token: idToken }),
  });
  window.history.replaceState(
    null,
    "",
    `${APP_ROUTES.GOOGLE_CALLBACK}#${parameters}`,
  );
  return { context, idToken };
}

async function mount(
  path: string = APP_ROUTES.GOOGLE_CALLBACK,
  currentUser: User | null = null,
  loading = false,
  strict = false,
) {
  store = createAppStore();
  if (!loading) store.dispatch(authReady(currentUser));
  if (currentUser) tokenStorage.setTokens("current-access", "current-refresh");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const tree = (
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          { pathname: path, state: { from: { pathname: "/bookmarks" } } },
        ]}
      >
        <Routes>
          <Route
            path={APP_ROUTES.GOOGLE_CALLBACK}
            element={<GoogleCallbackPage />}
          />
          <Route path={APP_ROUTES.HOME} element={<p>Home feed</p>} />
          <Route path={APP_ROUTES.SETTINGS} element={<AccountConnections />} />
          <Route
            path={APP_ROUTES.ADMIN_SETTINGS}
            element={
              <>
                <p>Admin settings</p>
                <AccountConnections />
              </>
            }
          />
          <Route path={APP_ROUTES.LANDING} element={<LandingPage />} />
          <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  await act(async () =>
    root!.render(strict ? <StrictMode>{tree}</StrictMode> : tree),
  );
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { resolve, promise };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  api.loginWithGoogle
    .mockReset()
    .mockResolvedValue({
      userId: "u1",
      username: "user",
      accessToken: "test-access",
      refreshToken: "test-refresh",
    });
  api.linkGoogle.mockReset().mockResolvedValue(undefined);
  api.me.mockReset().mockResolvedValue(user);
});
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Google redirect completion", () => {
  it.each(["signin", "signup"] as const)(
    "completes %s through /me and always opens Home",
    async (mode) => {
      const { idToken } = prepare(mode);
      await mount();
      expect(host.textContent).toBe("Home feed");
      expect(api.loginWithGoogle).toHaveBeenCalledExactlyOnceWith(
        { idToken },
        expect.any(AbortSignal),
      );
      expect(api.me).toHaveBeenCalledTimes(1);
      expect(store.getState().auth.user).toEqual(user);
      expect(window.location.hash).toBe("");
    },
  );

  it.each([APP_ROUTES.SETTINGS, APP_ROUTES.ADMIN_SETTINGS])(
    "links and returns to %s with one-time confirmation",
    async (returnTo) => {
      prepare("link", returnTo);
      await mount(APP_ROUTES.GOOGLE_CALLBACK, user);
      expect(api.linkGoogle).toHaveBeenCalledTimes(1);
      expect(api.loginWithGoogle).not.toHaveBeenCalled();
      expect(tokenStorage.getAccessToken()).toBe("current-access");
      expect(host.textContent).toContain("Google успішно прив’язано.");
      expect(store.getState().auth.user).toEqual(user);
    },
  );

  it("rejects linking after the signed-in account changes", async () => {
    prepare("link");
    await mount(APP_ROUTES.GOOGLE_CALLBACK, { ...user, id: "u2" });
    expect(api.linkGoogle).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Акаунт змінився");
    expect(host.textContent).not.toContain("Спробувати ще раз");
  });

  it("preserves a session established while the browser was on Google", async () => {
    prepare();
    await mount(APP_ROUTES.GOOGLE_CALLBACK, { ...user, id: "u2" });
    expect(api.loginWithGoogle).not.toHaveBeenCalled();
    expect(host.textContent).toBe("Home feed");
    expect(tokenStorage.getAccessToken()).toBe("current-access");
  });

  it("cleans the fragment before bootstrap completes and waits to authenticate", async () => {
    prepare();
    await mount(APP_ROUTES.GOOGLE_CALLBACK, null, true);
    expect(window.location.hash).toBe("");
    expect(api.loginWithGoogle).not.toHaveBeenCalled();
    await act(async () => store.dispatch(authCleared()));
    expect(api.loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(host.textContent).toBe("Home feed");
  });

  it("runs once under StrictMode and rejects replay after remount", async () => {
    prepare();
    await mount(APP_ROUTES.GOOGLE_CALLBACK, null, false, true);
    expect(api.loginWithGoogle).toHaveBeenCalledTimes(1);
    act(() => root!.unmount());
    host.remove();
    root = undefined;
    await mount();
    expect(api.loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(host.textContent).toContain("прострочена");
  });

  it("handles Google cancellation and starts a fresh attempt on retry", async () => {
    prepare("signin", undefined, "access_denied");
    await mount();
    expect(host.textContent).toContain("Авторизацію Google скасовано");
    expect(api.loginWithGoogle).not.toHaveBeenCalled();
    const assign = vi
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});
    act(() => host.querySelector("button")!.click());
    expect(assign).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("accounts.google.com"),
    );
    expect(sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)).not.toBeNull();
  });

  it("shows backend conflicts without navigating to Home", async () => {
    prepare();
    api.loginWithGoogle.mockRejectedValue(
      new ApiError(409, "Link Google first."),
    );
    await mount();
    expect(host.textContent).toContain("прив’яжіть Google у налаштуваннях");
    expect(api.me).not.toHaveBeenCalled();
  });

  it("clears a partial session after /me fails", async () => {
    prepare();
    api.me.mockRejectedValue(new Error("profile unavailable"));
    await mount();
    expect(host.querySelector("[role=alert]")).not.toBeNull();
    expect(tokenStorage.hasTokens()).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it("ignores a link response after logout", async () => {
    const pending = deferred<void>();
    api.linkGoogle.mockReturnValue(pending.promise);
    prepare("link");
    await mount(APP_ROUTES.GOOGLE_CALLBACK, user);
    await act(async () => {
      tokenStorage.clear();
      store.dispatch(sessionChanged());
      store.dispatch(authCleared());
      pending.resolve(undefined);
    });
    expect(host.textContent).toContain("Сесія змінилася");
    expect(host.textContent).not.toContain("Google успішно прив’язано");
  });

  it.each([APP_ROUTES.LANDING, APP_ROUTES.LOGIN, APP_ROUTES.REGISTER])(
    "starts same-tab Google navigation from %s",
    async (path) => {
      const assign = vi
        .spyOn(window.location, "assign")
        .mockImplementation(() => {});
      await mount(path);
      const button =
        host.querySelector<HTMLButtonElement>("button[aria-busy]")!;
      act(() => button.click());
      expect(assign).toHaveBeenCalledTimes(1);
      expect(api.loginWithGoogle).not.toHaveBeenCalled();
      if (path === APP_ROUTES.LANDING) {
        expect(
          host
            .querySelector("a[href='/register']")!
            .nextElementSibling!.contains(button),
        ).toBe(true);
      }
    },
  );
});
