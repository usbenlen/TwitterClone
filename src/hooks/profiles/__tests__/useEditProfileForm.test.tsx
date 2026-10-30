import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { User } from "@/types/user";

import { useEditProfileForm } from "@/hooks/profiles/useEditProfileForm";

vi.mock("@/hooks/composer/useLocationSearch", () => ({
  useLocationSearch: () => ({ reset: vi.fn() })
}));
vi.mock("@/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: () => ({})
}));
vi.mock("@/hooks/useImageCache", () => ({
  invalidateImageCache: vi.fn()
}));
vi.mock("@/hooks/useImageSelection", () => ({
  useImageSelection: () => ({ file: null, removed: false })
}));

describe("profile update payload", () => {
  it("sends an empty biography explicitly so the API can clear it", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user: User = {
      id: "u1",
      username: "user",
      bio: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isFollowedByCurrentUser: false,
      isVerified: false,
      createdAt: "2026-01-01",
    };
    let form!: ReturnType<typeof useEditProfileForm>;
    function Probe() {
      form = useEditProfileForm({ user, onSave, onClose });
      return null;
    }
    renderToString(<Probe />);
    await form.handleSave();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ bio: "" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
