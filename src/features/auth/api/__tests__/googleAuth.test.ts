// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/features/auth/api/authApi";
import { ApiError } from "@/shared/api/httpClient";
import { tokenStorage } from "@/shared/lib/tokenStorage";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: false }));

const tokens = {
  userId: "u1",
  username: "google-user",
  accessToken: "access",
  refreshToken: "refresh",
};
const fetchMock = vi.fn();

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("Google auth HTTP contract", () => {
  it("exchanges an ID token without attaching the existing bearer token", async () => {
    tokenStorage.setTokens("old-access", "old-refresh");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(tokens), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(
      await authApi.loginWithGoogle({ idToken: "google-id-token" }),
    ).toEqual(tokens);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/auth\/google$/);
    expect(options.method).toBe("POST");
    expect(options.headers.get("Authorization")).toBeNull();
    expect(JSON.parse(options.body)).toEqual({ idToken: "google-id-token" });
  });

  it("links with the current bearer token and accepts an empty 204 response", async () => {
    tokenStorage.setTokens("current-access", "current-refresh");
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const controller = new AbortController();
    expect(
      await authApi.linkGoogle(
        { idToken: "google-id-token" },
        controller.signal,
      ),
    ).toBeUndefined();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/auth\/google\/link$/);
    expect(options.headers.get("Authorization")).toBe("Bearer current-access");
    expect(JSON.parse(options.body)).toEqual({ idToken: "google-id-token" });
    expect(options.signal).toBe(controller.signal);
    expect(tokenStorage.getAccessToken()).toBe("current-access");
  });

  it("preserves conflict details and Retry-After without substituting mock data", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: "Link Google first." }), {
        status: 409,
        headers: {
          "Content-Type": "application/problem+json",
          "Retry-After": "30",
        },
      }),
    );
    const error = await authApi
      .loginWithGoogle({ idToken: "google-id-token" })
      .catch((reason) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      message: "Link Google first.",
      retryAfter: "30",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
