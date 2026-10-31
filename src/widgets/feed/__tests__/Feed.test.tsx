// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore } from "@/app/store/store";
import Feed from "@/widgets/feed/Feed";
import { postApi } from "@/features/content/api/postApi";
import { postsApi } from "@/features/content/api/postQueries";
import { recommendationsApi } from "@/features/discovery/api/recommendationApi";
import { sessionChanged } from "@/shared/store/session";

import type { Root } from "react-dom/client";
import type { AppStore } from "@/app/store/store";
import type { Post } from "@/features/content/types/post";
import type { CursorPage } from "@/shared/types/api";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/features/discovery/api/recommendationApi", () => ({
  recommendationsApi: { posts: vi.fn() },
}));
vi.mock("@/features/content/api/postApi", () => ({
  postApi: { getFeed: vi.fn() },
}));
vi.mock("@/widgets/navigation/pageHeader/PageHeader", () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock("@/features/content/components/composer/PostComposer", () => ({
  default: () => <div aria-label="Редактор допису" />,
}));
vi.mock("@/features/content/components/posts/PostCard", () => ({
  default: ({ post }: { post: Post }) => <article>{post.content}</article>,
}));

const post = { id: "p1", content: "Перший допис" } as Post;
const nextPost = { id: "p2", content: "Наступний допис" } as Post;
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
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function deferredPage() {
  let resolve!: (page: CursorPage<Post>) => void;
  const promise = new Promise<CursorPage<Post>>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

let store: AppStore;
let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("IntersectionObserver", ObserverMock);
  observers.length = 0;
  store = createAppStore();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(recommendationsApi.posts).mockResolvedValue({
    items: [post],
    nextCursor: "opaque+/=&ю",
    hasMore: true,
  });
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  host.remove();
  vi.unstubAllGlobals();
});

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
}

async function render() {
  await act(async () => {
    root.render(
      <Provider store={store}>
        <Feed />
      </Provider>,
    );
  });
  await flush();
}

async function intersect() {
  await act(async () => observers.at(-1)!.emit());
  await flush();
}

describe("home feed pagination", () => {
  it("appends cursor pages near the bottom, prevents concurrent loads and stops at the end", async () => {
    const pending = deferredPage();
    vi.mocked(recommendationsApi.posts)
      .mockReturnValueOnce(
        Promise.resolve({
          items: [post],
          nextCursor: "opaque+/=&ю",
          hasMore: true,
        }),
      )
      .mockReturnValueOnce(pending.promise);
    await render();
    expect(host.querySelector("h1")?.textContent).toBe("Головна");
    expect(host.querySelector('[aria-label="Редактор допису"]')).not.toBeNull();
    expect(recommendationsApi.posts).toHaveBeenCalledWith(10, null);
    expect(postApi.getFeed).not.toHaveBeenCalled();
    expect(observers[0].options?.rootMargin).toBe("0px 0px 400px 0px");
    const observer = observers[0];
    expect(observer.observe).toHaveBeenCalledWith(
      host.querySelector('div[aria-hidden="true"]'),
    );
    await act(async () => observer.emit(false));
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(1);
    await act(async () => {
      observer.emit();
      observer.emit();
    });
    await flush();
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(2);
    expect(recommendationsApi.posts).toHaveBeenLastCalledWith(
      10,
      "opaque+/=&ю",
    );
    expect(
      host.querySelector('[role="status"]')?.getAttribute("aria-label"),
    ).toBe("Завантаження дописів");
    expect(host.querySelector("article")?.textContent).toBe(post.content);
    await act(async () => {
      observer.emit();
      pending.resolve({
        items: [post, nextPost],
        nextCursor: null,
        hasMore: false,
      });
    });
    await flush();
    expect(
      [...host.querySelectorAll("article")].map((node) => node.textContent),
    ).toEqual([post.content, nextPost.content]);
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(host.querySelector('div[aria-hidden="true"]')).toBeNull();
    await act(async () => observer.emit());
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(2);
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it("continues after short, empty and overlapping pages while more cursors exist", async () => {
    vi.mocked(recommendationsApi.posts)
      .mockResolvedValueOnce({
        items: [post],
        nextCursor: "empty",
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [],
        nextCursor: "overlap",
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [post],
        nextCursor: "last",
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [nextPost],
        nextCursor: null,
        hasMore: false,
      });
    await render();
    await intersect();
    expect(observers).toHaveLength(2);
    await intersect();
    expect(observers).toHaveLength(3);
    expect(host.querySelectorAll("article")).toHaveLength(1);
    await intersect();
    expect(
      vi.mocked(recommendationsApi.posts).mock.calls.map((args) => args[1]),
    ).toEqual([null, "empty", "overlap", "last"]);
    expect(host.querySelectorAll("article")).toHaveLength(2);
  });

  it("retains loaded posts on failure and retries the failed cursor on request", async () => {
    vi.mocked(recommendationsApi.posts)
      .mockResolvedValueOnce({
        items: [post],
        nextCursor: "retry",
        hasMore: true,
      })
      .mockRejectedValueOnce(new Error("Немає з’єднання"));
    await render();
    const observer = observers[0];
    await intersect();
    expect(host.querySelector("article")?.textContent).toBe(post.content);
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(
      "Немає з’єднання",
    );
    await act(async () => observer.emit());
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(2);
    const retry = host.querySelector("button")!;
    expect(retry.textContent).toBe("Спробувати ще раз");
    const pending = deferredPage();
    vi.mocked(recommendationsApi.posts).mockReturnValueOnce(pending.promise);
    await act(async () => retry.click());
    await flush();
    expect(retry.disabled).toBe(true);
    expect(recommendationsApi.posts).toHaveBeenLastCalledWith(10, "retry");
    await act(async () =>
      pending.resolve({ items: [nextPost], nextCursor: null, hasMore: false }),
    );
    await flush();
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelectorAll("article")).toHaveLength(2);
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(3);
  });

  it("retries an initial failure and preserves the empty feed message", async () => {
    vi.mocked(recommendationsApi.posts)
      .mockRejectedValueOnce(new Error("Не вдалося завантажити стрічку"))
      .mockResolvedValueOnce({ items: [], nextCursor: null, hasMore: false });
    await render();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(
      "Не вдалося завантажити стрічку",
    );
    expect(observers).toHaveLength(0);
    await act(async () => host.querySelector("button")!.click());
    await flush();
    expect(recommendationsApi.posts).toHaveBeenLastCalledWith(10, null);
    expect(host.textContent).toContain(
      "Поки що тут порожньо. Опублікуйте перший твіт!",
    );
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it("keeps shared recommendation pages visible during the entry refresh", async () => {
    const query = store.dispatch(
      postsApi.endpoints.getRecommendedPosts.initiate(10),
    );
    await query;
    vi.mocked(recommendationsApi.posts).mockResolvedValueOnce({
      items: [nextPost],
      nextCursor: null,
      hasMore: false,
    });
    await store.dispatch(
      postsApi.endpoints.getRecommendedPosts.initiate(10, {
        direction: "forward",
      }),
    );
    expect(
      postsApi.endpoints.getRecommendedPosts.select(10)(store.getState()).data
        ?.pages,
    ).toHaveLength(2);
    const pending = deferredPage();
    vi.mocked(recommendationsApi.posts)
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce({
        items: [nextPost],
        nextCursor: null,
        hasMore: false,
      });
    await render();
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(3);
    expect(host.querySelectorAll("article")).toHaveLength(2);
    await act(async () =>
      pending.resolve({
        items: [post],
        nextCursor: "opaque+/=&ю",
        hasMore: true,
      }),
    );
    await flush();
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(4);
    expect(host.querySelectorAll("article")).toHaveLength(2);
    query.unsubscribe();
  });

  it("disconnects on unmount and ignores a next page completed after a session change", async () => {
    await render();
    const observer = observers[0];
    const pending = deferredPage();
    vi.mocked(recommendationsApi.posts).mockReturnValueOnce(pending.promise);
    await intersect();
    await act(async () => {
      root.render(null);
      store.dispatch(sessionChanged());
    });
    expect(observer.disconnect).toHaveBeenCalledOnce();
    await act(async () => {
      observer.emit();
      pending.resolve({ items: [nextPost], nextCursor: null, hasMore: false });
    });
    await flush();
    expect(recommendationsApi.posts).toHaveBeenCalledTimes(2);
    expect(
      postsApi.endpoints.getRecommendedPosts.select(10)(store.getState()).data,
    ).toBeUndefined();
  });
});
