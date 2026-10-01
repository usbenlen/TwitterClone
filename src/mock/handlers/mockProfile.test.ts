import { beforeEach, describe, expect, it, vi } from "vitest";
import { authReady, authReducer, authUserUpdated } from "@/store/auth";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

async function loadBackend() {
  const { currentUser } = await import("@/mock/data/users");
  const { mockAuthApi } = await import("@/mock/handlers/mockAuthApi");
  const { mockUserApi } = await import("@/mock/handlers/mockUserApi");
  return { currentUser, mockAuthApi, mockUserApi };
}

beforeEach(() => {
  vi.resetModules();
});

describe("mock profile saves with Redux auth state", () => {
  it("refreshes existing deep replies, ancestors and quotes on every profile save", async () => {
    const { currentUser, mockUserApi } = await loadBackend();
    const { mockCommentApi } = await import("@/mock/handlers/mockCommentApi");
    const { tweets, setTweets } = await import("@/mock/data/tweets");
    const { commentsByPostId } = await import("@/mock/data/comments");
    const { editHistoryStore } = await import("@/mock/stores/editHistoryStore");
    let parentCommentId = "c1";
    for (let level = 0; level < 3; level++) {
      const reply = await mockCommentApi.create({
        postId: "t1",
        parentCommentId,
        content: `Reply ${level}`,
      });
      parentCommentId = reply.id;
    }
    const before = structuredClone(
      await mockCommentApi.getThread(parentCommentId),
    );
    const otherAuthor = structuredClone(commentsByPostId.t1[0].author);
    const history = editHistoryStore.getHistory("comment", before.target);
    const quotedComment = structuredClone(before.target);
    setTweets([
      ...tweets,
      {
        ...structuredClone(tweets[1]),
        id: "profile-quote",
        quote: {
          targetId: quotedComment.id,
          targetType: "comment",
          targetVersionId: quotedComment.versionId,
          hasNewVersion: false,
          replyingToUsernames: [],
          target: quotedComment,
        },
      },
    ]);
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:profile-avatar");
    try {
      await mockUserApi.updateProfile({
        displayName: "Updated deep author",
        avatar: new File(["avatar"], "avatar.png", { type: "image/png" }),
      });
      const updated = await mockCommentApi.getThread(parentCommentId);
      const ownNodes = [updated.target, ...updated.ancestors].filter(
        (item) => item.author.id === currentUser.id,
      );
      expect(ownNodes.length).toBeGreaterThanOrEqual(3);
      for (const item of ownNodes) {
        expect(item.author).toMatchObject({
          displayName: "Updated deep author",
          avatarUrl: "blob:profile-avatar",
        });
      }
      expect(updated.ancestors.map((item) => item.id)).toEqual(
        before.ancestors.map((item) => item.id),
      );
      expect(updated.target.content).toBe(before.target.content);
      expect(updated.target.repliesCount).toBe(before.target.repliesCount);
      expect(commentsByPostId.t1[0].author).toEqual(otherAuthor);
      const { tweets: refreshedTweets } = await import("@/mock/data/tweets");
      expect(refreshedTweets.at(-1)?.quote?.target?.author.displayName).toBe(
        "Updated deep author",
      );
      expect(editHistoryStore.getHistory("comment", updated.target)).toEqual(
        history,
      );

      await mockUserApi.updateProfile({
        displayName: "Next name",
        removeAvatar: true,
      });
      const list = await mockCommentApi.getByPostId("t1");
      const replies = await mockUserApi.getReplies(currentUser.username);
      for (const items of [list, replies]) {
        const own = items.filter((item) => item.author.id === currentUser.id);
        expect(own.length).toBeGreaterThanOrEqual(3);
        for (const item of own) {
          expect(item.author).toMatchObject({
            displayName: "Next name",
            avatarUrl: null,
          });
          for (const ancestor of item.ancestors ?? []) {
            if (ancestor.author.id === currentUser.id)
              expect(ancestor.author).toMatchObject({
                displayName: "Next name",
                avatarUrl: null,
              });
          }
        }
      }
    } finally {
      createObjectURL.mockRestore();
    }
  });

  it("keeps the mock user and nested location mutable after authentication", async () => {
    const { currentUser, mockAuthApi } = await loadBackend();
    const response = await mockAuthApi.me();
    const state = authReducer(undefined, authReady(response));

    expect(Object.isFrozen(state.user)).toBe(true);
    expect(Object.isFrozen(state.user?.location)).toBe(true);
    expect(Object.isFrozen(currentUser)).toBe(false);
    expect(Object.isFrozen(currentUser.location)).toBe(false);
    expect(response).not.toBe(currentUser);
    expect(response.location).not.toBe(currentUser.location);
  });

  it("saves a name after authentication and exposes it in subsequent requests", async () => {
    const { currentUser, mockAuthApi, mockUserApi } = await loadBackend();
    const state = authReducer(undefined, authReady(await mockAuthApi.me()));
    const previousName = state.user?.displayName;

    const updated = await mockUserApi.updateProfile({
      displayName: "New name",
    });

    expect(updated.displayName).toBe("New name");
    expect(state.user?.displayName).toBe(previousName);
    expect((await mockAuthApi.me()).displayName).toBe("New name");
    expect(
      (await mockUserApi.getByUsername(currentUser.username)).displayName,
    ).toBe("New name");
  });

  it("supports repeated saves without freezing backend locations or changing old state", async () => {
    const { currentUser, mockAuthApi, mockUserApi } = await loadBackend();
    const initial = authReducer(undefined, authReady(await mockAuthApi.me()));
    const first = await mockUserApi.updateProfile({
      displayName: "First name",
      bio: "First bio",
      location: {
        id: "test-location",
        name: "Lviv",
        country: "Ukraine",
        latitude: 49.8397,
        longitude: 24.0297,
      },
    });
    const firstState = authReducer(initial, authUserUpdated(first));

    expect(Object.isFrozen(currentUser.location)).toBe(false);
    expect(first.location).not.toBe(currentUser.location);
    const second = await mockUserApi.updateProfile({
      displayName: "Second name",
      bio: "Second bio",
      removeLocation: true,
    });
    const secondState = authReducer(firstState, authUserUpdated(second));

    expect(secondState.user).toMatchObject({
      displayName: "Second name",
      bio: "Second bio",
      location: null,
    });
    expect(firstState.user).toMatchObject({
      displayName: "First name",
      bio: "First bio",
      location: { name: "Lviv" },
    });
    expect(await mockAuthApi.me()).toEqual(second);
    expect(await mockUserApi.getByUsername(currentUser.username)).toEqual(
      second,
    );
  });
});
