import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/api/client", () => ({ apiClient: client }));
vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));
vi.mock("@/mock/handlers", () => ({ mockUserApi: {} }));

import { userApi } from "@/api/user.api";

const response = {
  id: "u1",
  username: "alice",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  isVerified: false,
  createdAt: "2026-10-09T10:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  client.put.mockResolvedValue(response);
});

describe("profile update contract", () => {
  it("sends location as nested multipart fields", async () => {
    await userApi.updateProfile({
      location: {
        id: "kyiv",
        name: "Kyiv",
        country: "Ukraine",
        latitude: 50.45,
        longitude: 30.52,
      },
    });

    const form = client.put.mock.calls[0][1] as FormData;
    expect(form.get("Location.Id")).toBe("kyiv");
    expect(form.get("Location.Name")).toBe("Kyiv");
    expect(form.get("Location.Latitude")).toBe("50.45");
    expect(form.has("Location")).toBe(false);
    expect(form.has("RemoveLocation")).toBe(false);
  });

  it("sends only RemoveLocation when location is removed", async () => {
    await userApi.updateProfile({
      removeLocation: true,
      location: null,
    });

    const form = client.put.mock.calls[0][1] as FormData;
    expect(form.get("RemoveLocation")).toBe("true");
    expect([...form.keys()].some((key) => key.startsWith("Location."))).toBe(
      false,
    );
  });
});
