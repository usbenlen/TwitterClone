// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  consumeGoogleCallback,
  createGoogleRedirectUrl,
  startGoogleRedirect,
} from "@/features/auth/lib/googleRedirect";
import { APP_ROUTES } from "@/shared/config/routes";
import { STORAGE_KEYS } from "@/shared/constants/storage";

import type { GoogleRedirectContext } from "@/features/auth/types/auth";

vi.mock("@/features/auth/constants/auth", () => ({
  GOOGLE_CLIENT_ID: "test-client",
  GOOGLE_ID_TOKEN_MAX_LENGTH: 8192,
  GOOGLE_REDIRECT_MAX_AGE_MS: 900000,
}));
function pending() {
  return JSON.parse(
    sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)!,
  ) as GoogleRedirectContext;
}
function token(nonce: string) {
  return `header.${btoa(JSON.stringify({ nonce }))}.signature`;
}
function callback(parameters: Record<string, string>) {
  window.history.replaceState(
    { test: true },
    "",
    `${APP_ROUTES.GOOGLE_CALLBACK}#${new URLSearchParams(parameters)}`,
  );
}
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("Google redirect", () => {
  it("creates the same-tab OIDC URL and stores only a fresh correlation context", () => {
    const url = new URL(createGoogleRedirectUrl("signin"));
    expect(url.origin + url.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: "test-client",
      response_type: "id_token",
      response_mode: "fragment",
      scope: "openid email profile",
      prompt: "select_account",
      redirect_uri: `${window.location.origin}${APP_ROUTES.GOOGLE_CALLBACK}`,
    });
    expect(pending()).toMatchObject({
      mode: "signin",
      returnTo: APP_ROUTES.HOME,
      userId: null,
    });
    expect(pending().state).toMatch(/^[a-f0-9]{64}$/);
    expect(pending().nonce).not.toBe(pending().state);
    expect(sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)).not.toContain(
      "id_token",
    );
    const oldState = pending().state;
    createGoogleRedirectUrl("signup");
    expect(pending().state).not.toBe(oldState);
  });

  it("assigns the current tab instead of opening a popup", () => {
    const assign = vi
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});
    const open = vi.spyOn(window, "open");
    startGoogleRedirect("signin");
    expect(assign).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("accounts.google.com"),
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("requires a user for linking and restricts return destinations", () => {
    expect(() => createGoogleRedirectUrl("link")).toThrow(
      "Увійдіть до акаунта",
    );
    createGoogleRedirectUrl("link", "u1", APP_ROUTES.ADMIN_SETTINGS);
    expect(pending()).toMatchObject({
      userId: "u1",
      returnTo: APP_ROUTES.ADMIN_SETTINGS,
    });
    createGoogleRedirectUrl("link", "u1", "https://example.com");
    expect(pending().returnTo).toBe(APP_ROUTES.SETTINGS);
  });

  it("consumes the response once and scrubs the URL while preserving history state", () => {
    createGoogleRedirectUrl("signin");
    const context = pending();
    const idToken = token(context.nonce);
    callback({ state: context.state, id_token: idToken });
    expect(consumeGoogleCallback()).toEqual({ context, idToken });
    expect(window.location.hash).toBe("");
    expect(window.history.state).toEqual({ test: true });
    expect(sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)).toBeNull();
    expect(() => consumeGoogleCallback()).toThrow("завершена або прострочена");
  });

  it.each(["state", "nonce", "malformed", "missing"])(
    "rejects an invalid %s response",
    (failure) => {
      createGoogleRedirectUrl("signin");
      const context = pending();
      callback({
        state: failure === "state" ? "foreign" : context.state,
        ...(failure !== "missing" && {
          id_token:
            failure === "malformed"
              ? "not-a-jwt"
              : token(failure === "nonce" ? "foreign" : context.nonce),
        }),
      });
      expect(() => consumeGoogleCallback()).toThrow("Не вдалося перевірити");
      expect(window.location.hash).toBe("");
      expect(sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT)).toBeNull();
    },
  );

  it("rejects expired context", () => {
    createGoogleRedirectUrl("signin");
    const context = pending();
    callback({ state: context.state, id_token: token(context.nonce) });
    vi.spyOn(Date, "now").mockReturnValue(context.createdAt + 900001);
    expect(() => consumeGoogleCallback()).toThrow("прострочена");
  });

  it("handles denial and malformed storage without exposing OAuth details", () => {
    createGoogleRedirectUrl("signin");
    callback({
      state: pending().state,
      error: "access_denied",
      error_description: "private details",
    });
    expect(() => consumeGoogleCallback()).toThrow(
      "Авторизацію Google скасовано",
    );
    sessionStorage.setItem(STORAGE_KEYS.GOOGLE_REDIRECT, "broken-json");
    expect(() => consumeGoogleCallback()).toThrow("прострочена");
  });
});
