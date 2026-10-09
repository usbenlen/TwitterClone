import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "@/api/client";

afterEach(() => vi.unstubAllGlobals());

describe("API error responses", () => {
  it("reads RFC 7807 detail from application/problem+json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            title: "Invalid request",
            status: 400,
            detail: "Location cannot be provided when removal is requested.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/problem+json" },
          },
        ),
      ),
    );

    await expect(
      apiClient.get("test", { skipAuth: true }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Location cannot be provided when removal is requested.",
    });
  });

  it("preserves Retry-After for rate-limit handling", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ title: "Too many requests" }), {
          status: 429,
          headers: {
            "Content-Type": "application/problem+json",
            "Retry-After": "30",
          },
        }),
      ),
    );

    const error = await apiClient
      .get("test", { skipAuth: true })
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, retryAfter: "30" });
  });
});
