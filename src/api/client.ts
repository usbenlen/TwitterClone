/** @format */
import { API_BASE_URL, ENDPOINTS } from "@/api/config";
import { tokenStorage } from "@/utils/storage";
import type { RefreshResponse } from "@/types/auth";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  // Тіло запиту (буде серіалізовано в JSON автоматично)
  body?: unknown;
  skipAuth?: boolean;
}

// Обробка одночасних 401: щоб не робити кілька запитів на /refresh паралельно, зберігаєм один проміс оновлення
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const data = (await res.json()) as RefreshResponse;

    // Token rotation: сервер повертає нову пару токенів
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
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
): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Спроба оновити токен один раз при 401
  if (response.status === 401 && !skipAuth && !isRetry) {
    if (!refreshPromise) refreshPromise = refreshTokens();
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) return rawRequest<T>(path, options, true);
    handleUnauthorized();
    throw new ApiError(401, "Сесія завершена. Увійдіть знову.");
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("Content-Type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : typeof payload === "string" && payload
          ? payload
          : null) ?? `Помилка запиту (${response.status})`;
    throw new ApiError(response.status, message, payload);
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
