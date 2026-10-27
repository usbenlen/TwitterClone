import { describe, expect, it, vi } from "vitest";
import {
  createMockNotificationsApi,
  type MockNotificationEvent,
} from "@/mock/handlers/mockNotificationsApi";

vi.mock("@/mock/utils/delay", () => ({ delay: () => Promise.resolve() }));

function event(
  id: string,
  overrides: Partial<MockNotificationEvent> = {},
): MockNotificationEvent {
  return {
    id,
    type: "like",
    actor: { id: `actor-${id}`, username: `actor-${id}`, isVerified: false },
    target: { type: "post", id: "p1", preview: "Hello" },
    createdAt: "2026-10-27T12:00:00Z",
    ...overrides,
  };
}
function memoryStorage() {
  const saved = new Map<string, string>();
  return {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
  };
}

describe("mock notification inbox", () => {
  it("groups distinct actors by kind, target type and UTC day, and deduplicates retries", async () => {
    const first = event("1");
    const api = createMockNotificationsApi("viewer", [
      first,
      first,
      event("2"),
      event("3"),
      event("4"),
      event("repeat", { actor: first.actor }),
      event("comment", {
        target: { type: "comment", id: "p1", preview: null },
      }),
      event("repost", { type: "repost" }),
      event("yesterday", { createdAt: "2026-10-26T23:59:59Z" }),
      event("self", {
        actor: { id: "viewer", username: "me", isVerified: false },
      }),
    ]);
    const page = await api.list("all", 20);
    expect(page.items).toHaveLength(4);
    const group = page.items.find((item) => item.actorCount === 4)!;
    expect(group.actors).toHaveLength(3);
    expect(group.target?.type).toBe("post");
    expect(await api.unreadCount()).toEqual({ count: 4 });
  });

  it("filters mentions without duplicating a reply and leaves non-reaction events separate", async () => {
    const api = createMockNotificationsApi("viewer", [
      event("r1", { type: "reply", isMention: true }),
      event("r2", { type: "reply" }),
      event("m1", { type: "mention" }),
      event("q1", { type: "quote" }),
      event("f1", { type: "follow", target: null }),
    ]);
    expect((await api.list("all", 20)).items).toHaveLength(5);
    expect(
      (await api.list("mentions", 20)).items.map((item) => item.id).sort(),
    ).toEqual(["m1", "r1"]);
  });

  it("keeps cursor pages consistent when a newer event arrives", async () => {
    const api = createMockNotificationsApi(
      "viewer",
      Array.from({ length: 5 }, (_, index) =>
        event(String(index), { type: "reply" }),
      ),
    );
    const first = await api.list("all", 2);
    api.add(
      event("new", { type: "mention", createdAt: "2026-10-27T13:00:00Z" }),
    );
    const second = await api.list("all", 2, first.nextCursor);
    const third = await api.list("all", 2, second.nextCursor);
    const ids = [...first.items, ...second.items, ...third.items].map(
      (item) => item.id,
    );
    expect(new Set(ids).size).toBe(5);
    expect(ids).not.toContain("new");
    expect(third).toMatchObject({
      hasMore: false,
      nextCursor: null,
      readThrough: first.readThrough,
    });
    expect((await api.list("all", 2)).items[0].id).toBe("new");
  });

  it("reads only observed events, including a new arrival in an existing group", async () => {
    const api = createMockNotificationsApi("viewer", [
      event("1"),
      event("reply", { type: "reply" }),
    ]);
    const page = await api.list("all", 20);
    const group = page.items.find((item) => item.type === "like")!;
    await api.read(group.id, page.readThrough);
    expect(await api.unreadCount()).toEqual({ count: 1 });
    api.add(event("2", { createdAt: "2026-10-27T13:00:00Z" }));
    await api.readAll(page.readThrough);
    await api.readAll(page.readThrough);
    expect(await api.unreadCount()).toEqual({ count: 1 });
    const latest = await api.list("all", 20);
    expect(latest.items.find((item) => item.id === group.id)?.isRead).toBe(
      false,
    );
    await api.readAll(latest.readThrough);
    expect(await api.unreadCount()).toEqual({ count: 0 });
  });

  it("persists reads/settings per user and mutes only future events", async () => {
    const storage = memoryStorage();
    const seeds = [event("1")];
    const api = createMockNotificationsApi("viewer", seeds, storage);
    await api.updatePreferences({ likes: false });
    api.add(event("2"));
    expect((await api.list("all", 20)).items[0].actorCount).toBe(1);
    await api.readAll((await api.list("all", 20)).readThrough);
    const reloaded = createMockNotificationsApi("viewer", seeds, storage);
    expect(await reloaded.preferences()).toMatchObject({
      likes: false,
      replies: true,
    });
    expect(await reloaded.unreadCount()).toEqual({ count: 0 });
    const other = createMockNotificationsApi("other", seeds, storage);
    expect(await other.preferences()).toMatchObject({ likes: true });
    expect(await other.unreadCount()).toEqual({ count: 1 });
  });

  it("works when storage is blocked and rejects invalid requests", async () => {
    const api = createMockNotificationsApi("viewer", [event("1")], {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    await api.updatePreferences({ likes: false });
    expect(await api.preferences()).toMatchObject({ likes: false });
    await expect(api.list("all", 0)).rejects.toThrow();
    await expect(api.list("all", 20, "invalid")).rejects.toThrow();
    await expect(api.readAll("mock:999")).rejects.toThrow();
    await expect(api.read("missing", "mock:1")).rejects.toThrow();
    await expect(
      api.updatePreferences({ likes: "no" } as never),
    ).rejects.toThrow();
  });
});
