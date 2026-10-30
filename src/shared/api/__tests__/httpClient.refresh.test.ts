// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { realAdminApi } from "@/features/moderation/api/adminApi";
import {
  ApiError,
  apiClient,
  clearUnauthorizedHandler,
  setUnauthorizedHandler,
} from "@/shared/api/httpClient";
import { STORAGE_KEYS } from "@/shared/constants/storage";
import { tokenStorage } from "@/shared/lib/tokenStorage";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: false }));

const fetchMock = vi.fn();
const unauthorized = vi.fn();
const options = { refreshOnForbidden: true };
const rotatedTokens = {
  accessToken: "admin-access",
  refreshToken: "rotated-refresh",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function forbidden() {
  return new Response(JSON.stringify({ detail: "Access denied." }), {
    status: 403,
    headers: {
      "Content-Type": "application/problem+json",
      "Retry-After": "30",
    },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function isRefresh(url: unknown) {
  return String(url).endsWith("/auth/refresh");
}

function refreshCount() {
  return fetchMock.mock.calls.filter(([url]) => isRefresh(url)).length;
}

beforeEach(() => {
  localStorage.clear();
  tokenStorage.setTokens("user-access", "user-refresh");
  fetchMock.mockReset();
  unauthorized.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setUnauthorizedHandler(unauthorized);
});

afterEach(() => {
  clearUnauthorizedHandler();
  tokenStorage.clear();
  vi.unstubAllGlobals();
});

describe("administrative token refresh", () => {
  it("loads the real dashboard after refreshing a token with the old role", async () => {
    const metrics = [{ id: "users", title: "Users", value: 10 }];
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(json(rotatedTokens))
      .mockResolvedValueOnce(json(metrics));

    await expect(realAdminApi.metrics()).resolves.toEqual(metrics);

    const [first, refresh, retry] = fetchMock.mock.calls;
    expect(first[0]).toMatch(/admin\/dashboard\/metrics$/);
    expect(first[1].headers.get("Authorization")).toBe("Bearer user-access");
    expect(isRefresh(refresh[0])).toBe(true);
    expect(refresh[1].method).toBe("POST");
    expect(JSON.parse(refresh[1].body)).toEqual({
      refreshToken: "user-refresh",
    });
    expect(refresh[1].headers).not.toHaveProperty("Authorization");
    expect(retry[0]).toBe(first[0]);
    expect(retry[1].headers.get("Authorization")).toBe("Bearer admin-access");
    expect(first[1]).not.toHaveProperty("refreshOnForbidden");
    expect(tokenStorage.getRefreshToken()).toBe("rotated-refresh");
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it("preserves the mutation body, headers and signal when retrying", async () => {
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(json(rotatedTokens))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const controller = new AbortController();
    const body = { status: "resolved", decision: "kept" };

    await expect(
      apiClient.put("admin/moderation/r1/status", body, {
        ...options,
        signal: controller.signal,
        headers: { "X-Request-ID": "request-1" },
      }),
    ).resolves.toBeUndefined();

    const retry = fetchMock.mock.calls[2][1];
    expect(retry.method).toBe("PUT");
    expect(JSON.parse(retry.body)).toEqual(body);
    expect(retry.signal).toBe(controller.signal);
    expect(retry.headers.get("X-Request-ID")).toBe("request-1");
    expect(retry.headers.get("Content-Type")).toBe("application/json");
  });

  it("shares one refresh across concurrent dashboard 403s and a regular 401", async () => {
    const pending = deferred<Response>();
    fetchMock.mockImplementation((url, init) => {
      if (isRefresh(url)) return pending.promise;
      if (init.headers.get("Authorization") === "Bearer user-access")
        return Promise.resolve(
          String(url).endsWith("/me") ? json({}, 401) : forbidden(),
        );
      return Promise.resolve(json([]));
    });
    const requests = Promise.all([
      realAdminApi.metrics(),
      realAdminApi.analytics("7d"),
      apiClient.get("me"),
    ]);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(refreshCount()).toBe(1);

    pending.resolve(json(rotatedTokens));
    await expect(requests).resolves.toEqual([[], [], []]);
    expect(refreshCount()).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(7);
  });

  it.each([401, 403])(
    "reuses rotated tokens for a late %s without another refresh",
    async (status) => {
      const lateResponse = deferred<Response>();
      fetchMock.mockImplementation((url, init) => {
        if (isRefresh(url)) return Promise.resolve(json(rotatedTokens));
        if (init.headers.get("Authorization") === "Bearer admin-access")
          return Promise.resolve(json([]));
        if (String(url).endsWith("/late")) return lateResponse.promise;
        return Promise.resolve(forbidden());
      });
      const late = apiClient.get("admin/late", options);
      await realAdminApi.metrics();
      lateResponse.resolve(json({ detail: "Old token." }, status));

      await expect(late).resolves.toEqual([]);
      expect(refreshCount()).toBe(1);
      expect(fetchMock).toHaveBeenCalledTimes(5);
    },
  );

  it("returns a genuine 403 after one retry without logging out", async () => {
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(json(rotatedTokens))
      .mockResolvedValueOnce(forbidden());

    await expect(realAdminApi.metrics()).rejects.toMatchObject({
      status: 403,
      message: "Access denied.",
      data: { detail: "Access denied." },
      retryAfter: "30",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(unauthorized).not.toHaveBeenCalled();
    expect(tokenStorage.getAccessToken()).toBe("admin-access");
  });

  it.each(["unauthorized", "unavailable", "network"])(
    "preserves the original 403 when refresh is %s",
    async (failure) => {
      fetchMock.mockResolvedValueOnce(forbidden());
      if (failure === "network")
        fetchMock.mockRejectedValueOnce(new TypeError("Offline"));
      else
        fetchMock.mockResolvedValueOnce(
          json({}, failure === "unauthorized" ? 401 : 503),
        );

      await expect(realAdminApi.metrics()).rejects.toMatchObject({
        status: 403,
        message: "Access denied.",
        retryAfter: "30",
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(unauthorized).not.toHaveBeenCalled();
      expect(tokenStorage.getAccessToken()).toBe("user-access");
    },
  );

  it("does not refresh a 403 without a refresh token", async () => {
    tokenStorage.clear();
    tokenStorage.setAccessToken("user-access");
    fetchMock.mockResolvedValueOnce(forbidden());

    await expect(realAdminApi.metrics()).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it.each([{ skipAuth: false }, { skipAuth: true, refreshOnForbidden: true }])(
    "does not refresh forbidden requests with %j",
    async (requestOptions) => {
      fetchMock.mockResolvedValueOnce(forbidden());
      await expect(
        apiClient.get("posts/p1", requestOptions),
      ).rejects.toMatchObject({ status: 403 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      if (requestOptions.skipAuth)
        expect(
          fetchMock.mock.calls[0][1].headers.get("Authorization"),
        ).toBeNull();
    },
  );
});

describe("refresh session safety", () => {
  it.each(["logout", "login", "same tokens", "another tab"])(
    "discards refresh completion after %s",
    async (change) => {
      const pending = deferred<Response>();
      fetchMock
        .mockResolvedValueOnce(forbidden())
        .mockReturnValueOnce(pending.promise);
      const result = realAdminApi.metrics();
      const assertion = expect(result).rejects.toMatchObject({
        name: "AbortError",
      });
      await vi.waitFor(() => expect(refreshCount()).toBe(1));

      if (change === "logout") tokenStorage.clear();
      else if (change === "same tokens") {
        tokenStorage.clear();
        tokenStorage.setTokens("user-access", "user-refresh");
      } else if (change === "another tab") {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, "other-access");
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "other-refresh");
      } else tokenStorage.setTokens("other-access", "other-refresh");

      const expectedAccess = tokenStorage.getAccessToken();
      const expectedRefresh = tokenStorage.getRefreshToken();
      pending.resolve(json(rotatedTokens));
      await assertion;

      expect(tokenStorage.getAccessToken()).toBe(expectedAccess);
      expect(tokenStorage.getRefreshToken()).toBe(expectedRefresh);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(unauthorized).not.toHaveBeenCalled();
    },
  );

  it("does not clear a new session after an old 401 refresh fails", async () => {
    const pending = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockReturnValueOnce(pending.promise);
    const assertion = expect(apiClient.get("me")).rejects.toMatchObject({
      name: "AbortError",
    });
    await vi.waitFor(() => expect(refreshCount()).toBe(1));
    tokenStorage.setTokens("other-access", "other-refresh");
    pending.resolve(json({}, 401));

    await assertion;
    expect(tokenStorage.getAccessToken()).toBe("other-access");
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it("does not refresh or replay an old request under a new account", async () => {
    const pending = deferred<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const assertion = expect(realAdminApi.metrics()).rejects.toMatchObject({
      name: "AbortError",
    });
    tokenStorage.setTokens("other-access", "other-refresh");
    pending.resolve(forbidden());
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("lets a new session refresh independently of an old pending refresh", async () => {
    const oldRefresh = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockReturnValueOnce(oldRefresh.promise);
    const oldAssertion = expect(realAdminApi.metrics()).rejects.toMatchObject({
      name: "AbortError",
    });
    await vi.waitFor(() => expect(refreshCount()).toBe(1));

    tokenStorage.setTokens("other-access", "other-refresh");
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(
        json({ accessToken: "new-admin", refreshToken: "new-refresh" }),
      )
      .mockResolvedValueOnce(json([]));
    await expect(realAdminApi.metrics()).resolves.toEqual([]);
    oldRefresh.resolve(json(rotatedTokens));
    await oldAssertion;
    expect(tokenStorage.getAccessToken()).toBe("new-admin");
    expect(tokenStorage.getRefreshToken()).toBe("new-refresh");
    expect(refreshCount()).toBe(2);
  });

  it("does not replay a cancelled request while another request finishes the shared refresh", async () => {
    const pending = deferred<Response>();
    fetchMock.mockImplementation((url, init) => {
      if (isRefresh(url)) return pending.promise;
      if (init.headers.get("Authorization") === "Bearer user-access")
        return Promise.resolve(forbidden());
      return Promise.resolve(json([]));
    });
    const controller = new AbortController();
    const cancelled = expect(
      apiClient.get("admin/cancelled", {
        ...options,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    const active = realAdminApi.metrics();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    controller.abort();
    pending.resolve(json(rotatedTokens));

    await cancelled;
    await expect(active).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(refreshCount()).toBe(1);
  });
});

describe("existing transport behavior", () => {
  it("refreshes a regular 401 and retries once", async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(rotatedTokens))
      .mockResolvedValueOnce(json({ id: "u1" }));
    await expect(apiClient.get("me")).resolves.toEqual({ id: "u1" });
    expect(refreshCount()).toBe(1);
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it("ends the active session when a 401 refresh fails", async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({}, 401));
    await expect(apiClient.get("me")).rejects.toMatchObject({
      status: 401,
      message: "Сесія завершена. Увійдіть знову.",
    });
    expect(tokenStorage.hasTokens()).toBe(false);
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not refresh again when the retry also returns 401", async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(rotatedTokens))
      .mockResolvedValueOnce(json({ detail: "Still unauthorized." }, 401));
    await expect(apiClient.get("me")).rejects.toMatchObject({
      status: 401,
      message: "Still unauthorized.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("keeps multipart headers browser-managed and accepts text responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response("uploaded"));
    const form = new FormData();
    form.append(
      "File",
      new Blob(["image"], { type: "image/png" }),
      "image.png",
    );
    await expect(apiClient.post("media", form)).resolves.toBe("uploaded");
    expect(fetchMock.mock.calls[0][1].body).toBe(form);
    expect(fetchMock.mock.calls[0][1].headers.get("Content-Type")).toBeNull();
  });
});
