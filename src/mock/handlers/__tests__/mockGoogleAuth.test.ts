import { beforeEach, describe, expect, it, vi } from "vitest";

import { currentUser } from "@/mock/data/users";
import { mockAuthApi } from "@/mock/handlers/mockAuthApi";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
beforeEach(() => vi.clearAllMocks());

describe("mock Google auth", () => {
  it("uses the existing mock account and token contract", async () => {
    expect(
      await mockAuthApi.loginWithGoogle({ idToken: "mock-id-token" }),
    ).toMatchObject({
      userId: currentUser.id,
      username: currentUser.username,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
    await expect(
      mockAuthApi.linkGoogle({ idToken: "mock-id-token" }),
    ).resolves.toBeUndefined();
  });

  it.each(["", " ", "x".repeat(8193)])(
    "rejects invalid credentials (%#)",
    async (idToken) => {
      await expect(mockAuthApi.loginWithGoogle({ idToken })).rejects.toThrow(
        "Некоректний токен Google",
      );
      await expect(mockAuthApi.linkGoogle({ idToken })).rejects.toThrow(
        "Некоректний токен Google",
      );
    },
  );

  it("honors cancellation before any simulated auth response", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      mockAuthApi.loginWithGoogle(
        { idToken: "mock-id-token" },
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
    await expect(
      mockAuthApi.linkGoogle({ idToken: "mock-id-token" }, controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
