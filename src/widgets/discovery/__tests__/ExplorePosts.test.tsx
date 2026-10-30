// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExplorePosts } from "@/widgets/discovery/ExplorePosts";

import type { Root } from "react-dom/client";

const query = vi.hoisted(() => ({ posts: vi.fn() }));
vi.mock("@/features/content/api/postQueries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/content/api/postQueries")>();
  return { ...actual, useGetRecommendedPostsInfiniteQuery: query.posts };
});
vi.mock("@/widgets/feed/FeedList", () => ({
  default: ({ posts }: { posts: { id: string; content: string }[] }) => (
    <div>
      {posts.map((post) => (
        <p key={post.id}>{post.content}</p>
      ))}
    </div>
  ),
}));

const post = { id: "p1", content: "Already loaded post" };
const observers: ObserverMock[] = [];

class ObserverMock {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
    observers.push(this);
  }

  emit(isIntersecting = true) {
    this.callback(
      [
        {
          isIntersecting,
          target: this.observe.mock.calls[0]?.[0],
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function queryState() {
  return {
    data: { pages: [{ items: [post] }] },
    hasNextPage: true,
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    direction: undefined as "forward" | "backward" | undefined,
    error: null as { message: string } | null,
    fetchNextPage: vi.fn<() => Promise<unknown>>().mockResolvedValue({}),
    refetch: vi.fn<() => Promise<unknown>>().mockResolvedValue({}),
  };
}

let state: ReturnType<typeof queryState>;
let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("IntersectionObserver", ObserverMock);
  observers.length = 0;
  state = queryState();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function render(changes: Partial<typeof state> = {}) {
  Object.assign(state, changes);
  query.posts.mockReturnValue(state);
  await act(async () => root.render(<ExplorePosts />));
}

describe("Explore automatic post pagination", () => {
  it("prefetches near the end and ignores repeated notifications while a page is pending", async () => {
    let finish!: () => void;
    state.fetchNextPage.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    await render();
    const observer = observers[0];
    expect(observer.options?.rootMargin).toBe("0px 0px 400px 0px");
    expect(observer.observe).toHaveBeenCalledWith(
      host.querySelector('[aria-hidden="true"]'),
    );
    expect(host.textContent).not.toContain("Показати ще");
    expect(state.fetchNextPage).not.toHaveBeenCalled();
    await act(async () => observer.emit(false));
    expect(state.fetchNextPage).not.toHaveBeenCalled();
    await act(async () => {
      observer.emit();
      observer.emit();
    });
    expect(state.fetchNextPage).toHaveBeenCalledTimes(1);
    await render({ isFetching: true, isFetchingNextPage: true });
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(
      host.querySelector('[role="status"]')?.getAttribute("aria-label"),
    ).toBe("Завантаження дописів");
    expect(host.textContent).toContain(post.content);
    await act(async () => {
      observer.emit();
      finish();
    });
    expect(state.fetchNextPage).toHaveBeenCalledTimes(1);
    await render({
      isFetching: false,
      isFetchingNextPage: false,
      data: {
        pages: [
          { items: [post] },
          { items: [{ id: "p2", content: "Next post" }] },
        ],
      },
    });
    expect(host.textContent).toContain("Next post");
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(observers).toHaveLength(2);
  });

  it("rechecks short, empty and overlapping pages even when fetching updates are batched", async () => {
    await render();
    await act(async () => observers.at(-1)!.emit());
    await render({ data: { pages: [{ items: [post] }, { items: [] }] } });
    expect(observers).toHaveLength(2);
    await act(async () => observers.at(-1)!.emit());
    await render({
      data: { pages: [{ items: [post] }, { items: [] }, { items: [post] }] },
    });
    expect(observers).toHaveLength(3);
    expect(host.querySelectorAll("p")).toHaveLength(1);
    await act(async () => observers.at(-1)!.emit());
    expect(state.fetchNextPage).toHaveBeenCalledTimes(3);
  });

  it("stops after the last page and ignores queued observer callbacks", async () => {
    await render();
    const observer = observers[0];
    await render({ hasNextPage: false });
    expect(observer.disconnect).toHaveBeenCalledOnce();
    await act(async () => observer.emit());
    expect(state.fetchNextPage).not.toHaveBeenCalled();
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("pauses on next-page errors, retains posts and retries only when requested", async () => {
    state.fetchNextPage.mockRejectedValueOnce(new Error("offline"));
    await render();
    const observer = observers[0];
    await act(async () => observer.emit());
    await render({
      error: { message: "Page offline" },
      direction: "forward",
    });
    expect(host.textContent).toContain(post.content);
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(
      "Page offline",
    );
    await act(async () => observer.emit());
    expect(state.fetchNextPage).toHaveBeenCalledTimes(1);
    await act(async () => host.querySelector("button")!.click());
    expect(state.fetchNextPage).toHaveBeenCalledTimes(2);
    expect(state.refetch).not.toHaveBeenCalled();
    await render({ isFetching: true, isFetchingNextPage: true });
    expect(host.querySelector("button")?.disabled).toBe(true);
    await render({
      error: null,
      isFetching: false,
      isFetchingNextPage: false,
      direction: undefined,
    });
    expect(observers).toHaveLength(2);
  });

  it("waits for initial loading and retries initial failures through refetch", async () => {
    await render({
      data: undefined,
      isLoading: true,
      isFetching: true,
      hasNextPage: false,
    });
    expect(observers).toHaveLength(0);
    await render({
      isLoading: false,
      isFetching: false,
      error: { message: "Initial offline" },
    });
    await act(async () => host.querySelector("button")!.click());
    expect(state.refetch).toHaveBeenCalledOnce();
    expect(state.fetchNextPage).not.toHaveBeenCalled();
    await render({ isFetching: true });
    expect(host.querySelector("button")?.disabled).toBe(true);
  });

  it("retries a failed next page even when earlier pages contained no posts", async () => {
    await render({
      data: { pages: [{ items: [] }] },
      error: { message: "Page offline" },
      direction: "forward",
    });
    expect(observers).toHaveLength(0);
    await act(async () => host.querySelector("button")!.click());
    expect(state.fetchNextPage).toHaveBeenCalledOnce();
    expect(state.refetch).not.toHaveBeenCalled();
  });

  it("disconnects on unmount even with a request still pending", async () => {
    let finish!: () => void;
    state.fetchNextPage.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    await render();
    const observer = observers[0];
    await act(async () => observer.emit());
    await act(async () => root.render(null));
    expect(observer.disconnect).toHaveBeenCalledOnce();
    await act(async () => {
      observer.emit();
      finish();
    });
    expect(state.fetchNextPage).toHaveBeenCalledOnce();
  });
});
