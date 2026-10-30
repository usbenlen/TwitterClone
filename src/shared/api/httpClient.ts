import { API_BASE_URL, ENDPOINTS } from "@/shared/api/apiEndpoints";
import { tokenStorage } from "@/shared/lib/tokenStorage";

import type { RefreshResponse } from "@/features/auth/types";
import type { ProblemDetails } from "@/shared/types";

export class ApiError extends Error {
  status: number;
  data: unknown;
  retryAfter: string | null;

  constructor(
    status: number,
    message: string,
    data?: unknown,
    retryAfter: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.retryAfter = retryAfter;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  refreshOnForbidden?: boolean;
}

interface TokenSession {
  version: number;
  accessToken: string | null;
  refreshToken: string | null;
}

let currentSession: TokenSession | null = null;
let pendingRefresh: {
  session: TokenSession;
  promise: Promise<boolean>;
} | null = null;

function readTokenSession(): TokenSession {
  return {
    version: tokenStorage.getVersion(),
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
  };
}

function getTokenSession(): TokenSession {
  const stored = readTokenSession();
  if (
    !currentSession ||
    currentSession.version !== stored.version ||
    currentSession.accessToken !== stored.accessToken ||
    currentSession.refreshToken !== stored.refreshToken
  )
    currentSession = stored;
  return currentSession;
}

function ensureActiveSession(
  session: TokenSession,
  signal?: AbortSignal | null,
) {
  signal?.throwIfAborted();
  if (getTokenSession() !== session) throw new DOMException("Сесію змінено.", "AbortError");
}

async function refreshTokens(session: TokenSession): Promise<boolean> {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const data = (await res.json()) as RefreshResponse;
    if (getTokenSession() !== session) return false;

    // Ротація продовжує цю ж сесію; інші записи в storage створюють нову.
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    Object.assign(session, readTokenSession());
    return true;
  } catch {
    return false;
  }
}

function refreshSession(session: TokenSession): Promise<boolean> {
  if (pendingRefresh?.session === session) return pendingRefresh.promise;

  const pending = { session, promise: refreshTokens(session) };
  pendingRefresh = pending;
  pending.promise = pending.promise.finally(() => {
    if (pendingRefresh === pending) pendingRefresh = null;
  });
  return pending.promise;
}

// Викликається при остаточній втраті сесії
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function clearUnauthorizedHandler() {
  onUnauthorized = null;
}

function handleUnauthorized() {
  tokenStorage.clear();
  onUnauthorized?.();
}

async function rawRequest<T>(
  path: string,
  options: RequestOptions,
  isRetry = false,
  session?: TokenSession,
): Promise<T> {
  const { body, skipAuth, refreshOnForbidden, headers, ...rest } = options;
  const requestSession = skipAuth ? undefined : (session ?? getTokenSession());
  if (requestSession) ensureActiveSession(requestSession, options.signal);
  const accessToken = requestSession?.accessToken;
  const tokenVersion = requestSession?.version;

  const finalHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData))
    finalHeaders.set("Content-Type", "application/json");

  if (!skipAuth) {
    if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestBody =
    body instanceof FormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: requestBody,
  });

  if (requestSession) ensureActiveSession(requestSession, options.signal);

  // 403 потребує явного дозволу адаптера; будь-який запит повторюємо лише раз.
  if (
    requestSession &&
    !isRetry &&
    (response.status === 401 || (response.status === 403 && refreshOnForbidden))
  ) {
    const refreshed = requestSession.version !== tokenVersion || (await refreshSession(requestSession));
    ensureActiveSession(requestSession, options.signal);

    if (refreshed) return rawRequest<T>(path, options, true, requestSession);
    if (response.status === 401) {
      handleUnauthorized();
      throw new ApiError(401, "Сесія завершена. Увійдіть знову.");
    }
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("Content-Type") ?? "";
  const payload = contentType.toLowerCase().includes("json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const problem =
      payload && typeof payload === "object"
        ? (payload as ProblemDetails & { message?: unknown })
        : null;
    const message =
      (problem?.detail
        ? problem.detail
        : problem?.title
          ? problem.title
          : problem?.message
            ? String(problem.message)
            : typeof payload === "string" && payload
              ? payload
              : null) ?? `Помилка запиту (${response.status})`;
    throw new ApiError(
      response.status,
      message,
      payload,
      response.headers.get("Retry-After"),
    );
  }

  return payload as T;
}

// Типізований HTTP-клієнт
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "DELETE" }),
};
