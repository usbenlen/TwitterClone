import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tweetApi, commentApi, userApi, searchApi, pollApi } from "@/api";
import { createAppStore, type AppStore } from "./index";
import { postsApi, publishPosts, type PostsQuery } from "./postsApi";
import { runReaction } from "./reactions";
import { sessionChanged } from "./session";
import type {
  Tweet,
  ThreadResponse,
  SearchCriteria,
  ToggleLikeResponse,
  ToggleBookmarkResponse,
} from "@/types";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));

vi.mock("@/api", () => {
  const api = () => ({
    getFeed: vi.fn(),
    getBookmarked: vi.fn(),
    getByPostId: vi.fn(),
    getThread: vi.fn(),
    getEditHistory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleLike: vi.fn(),
    toggleRepost: vi.fn(),
    toggleBookmark: vi.fn(),
    view: vi.fn(),
  });
  return {
    tweetApi: api(),
    commentApi: api(),
    userApi: {
      getPosts: vi.fn(),
      getReplies: vi.fn(),
      getLikes: vi.fn(),
      getReposts: vi.fn(),
    },
    searchApi: { posts: vi.fn(), users: vi.fn() },
    pollApi: { vote: vi.fn() },
  };
});

function tweet(overrides: Partial<Tweet> = {}): Tweet {
  return {
    id: "p1",
    versionId: "v1",
    content: "hello",
    author: {
      id: "u1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
      isVerified: false,
    },
    attachments: [],
    likesCount: 0,
    repliesCount: 0,
    retweetsCount: 0,
    viewsCount: 0,
    likedByMe: false,
    repostedByMe: false,
    bookmarkedByMe: false,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const feed: PostsQuery = { kind: "feed" };
const bookmarks: PostsQuery = { kind: "bookmarks" };
let store: AppStore;
let posts: Tweet[];
let comments: Tweet[];
const clone = <T>(value: T): T => structuredClone(value);
const read = (arg: PostsQuery = feed) =>
  postsApi.endpoints.getPosts.select(arg)(store.getState()).data;
const load = (arg: PostsQuery = feed) =>
  store.dispatch(postsApi.endpoints.getPosts.initiate(arg));

beforeEach(() => {
  vi.resetAllMocks();
  store = createAppStore();
  posts = [tweet()];
  comments = [];
  vi.mocked(tweetApi.getFeed).mockImplementation(async () => clone(posts));
  vi.mocked(tweetApi.getBookmarked).mockImplementation(async () =>
    clone(posts.filter((item) => item.bookmarkedByMe)),
  );
  vi.mocked(commentApi.getBookmarked).mockImplementation(async () =>
    clone(comments.filter((item) => item.bookmarkedByMe)),
  );
  vi.mocked(commentApi.getByPostId).mockImplementation(async () =>
    clone(comments),
  );
  vi.mocked(commentApi.getThread).mockImplementation(async (id) => {
    const target = [...posts, ...comments].find((item) => item.id === id);
    if (!target) throw new Error("Not found");
    return clone({
      target,
      ancestors: [],
      replies: comments,
    } as ThreadResponse);
  });
  vi.mocked(userApi.getPosts).mockImplementation(async () => clone(posts));
  vi.mocked(userApi.getLikes).mockImplementation(async () =>
    clone(posts.filter((item) => item.likedByMe)),
  );
  vi.mocked(userApi.getReposts).mockImplementation(async () =>
    clone(posts.filter((item) => item.repostedByMe)),
  );
  vi.mocked(userApi.getReplies).mockImplementation(async () => clone(comments));
  vi.mocked(searchApi.posts).mockImplementation(async () => clone(posts));
});

afterEach(() => {
  store.dispatch(sessionChanged());
});

describe("post queries and mutations", () => {
  it("does not freeze objects owned by the mock backend", async () => {
    vi.mocked(tweetApi.getFeed).mockResolvedValueOnce(posts);
    await load();
    expect(Object.isFrozen(posts[0].author)).toBe(false);
    posts[0].author.displayName = "Updated profile";
    expect(read()?.[0].author.displayName).toBe("Alice");
  });

  it("shares an in-flight feed request and preserves unchanged references", async () => {
    const response = deferred<Tweet[]>();
    vi.mocked(tweetApi.getFeed).mockReturnValueOnce(response.promise);
    const first = load();
    const second = load();
    expect(tweetApi.getFeed).toHaveBeenCalledTimes(1);
    response.resolve(clone(posts));
    await Promise.all([first, second]);
    const before = read();
    await store.dispatch(
      postsApi.endpoints.getHistory.initiate({ type: "post", id: "missing" }),
    );
    expect(read()).toBe(before);
  });

  it("optimistically updates feed, profile and thread and rejects duplicate clicks", async () => {
    const profile: PostsQuery = {
      kind: "profile",
      username: "alice",
      tab: "posts",
    };
    await Promise.all([
      load(),
      load(profile),
      store.dispatch(postsApi.endpoints.getThread.initiate("p1")),
    ]);
    const response = deferred<ToggleLikeResponse>();
    vi.mocked(tweetApi.toggleLike).mockReturnValueOnce(response.promise);
    const reaction = runReaction(store, {
      id: "p1",
      type: "post",
      action: "like",
      active: false,
    });
    expect(read()?.[0].likesCount).toBe(1);
    expect(read(profile)?.[0].likedByMe).toBe(true);
    expect(
      postsApi.endpoints.getThread.select("p1")(store.getState()).data?.target
        .likedByMe,
    ).toBe(true);
    expect(
      await runReaction(store, {
        id: "p1",
        type: "post",
        action: "like",
        active: false,
      }),
    ).toBe(false);
    expect(tweetApi.toggleLike).toHaveBeenCalledTimes(1);
    posts[0] = { ...posts[0], likedByMe: true, likesCount: 8 };
    response.resolve({ likedByMe: true, likesCount: 8 });
    expect(await reaction).toBe(true);
    await vi.waitFor(() => expect(read()?.[0].likesCount).toBe(8));
  });

  it("rolls back a failed unbookmark without losing the bookmarked row", async () => {
    posts[0].bookmarkedByMe = true;
    await Promise.all([load(), load(bookmarks)]);
    const response = deferred<{ bookmarkedByMe: boolean }>();
    vi.mocked(tweetApi.toggleBookmark).mockReturnValueOnce(response.promise);
    const reaction = runReaction(store, {
      id: "p1",
      type: "post",
      action: "bookmark",
      active: true,
    });
    expect(read(bookmarks)?.[0].bookmarkedByMe).toBe(false);
    response.reject(new Error("offline"));
    expect(await reaction).toBe(false);
    expect(read(bookmarks)?.[0].bookmarkedByMe).toBe(true);
    expect(read()?.[0].bookmarkedByMe).toBe(true);
  });

  it("rolls back by identity when another post is inserted during a reaction", async () => {
    posts[0].likesCount = 5;
    await load();
    const response = deferred<ToggleLikeResponse>();
    vi.mocked(tweetApi.toggleLike).mockReturnValueOnce(response.promise);
    const reaction = runReaction(store, {
      id: "p1",
      type: "post",
      action: "like",
      active: false,
    });
    const created = tweet({ id: "new", likesCount: 77 });
    posts.unshift(created);
    publishPosts([clone(created)], store.dispatch, store.getState());
    response.reject(new Error("offline"));
    await reaction;
    expect(read()?.find((item) => item.id === "new")?.likesCount).toBe(77);
    expect(read()?.find((item) => item.id === "p1")?.likesCount).toBe(5);
  });

  it("supports empty bookmark responses and refreshes membership", async () => {
    await Promise.all([load(), load(bookmarks)]);
    vi.mocked(
      tweetApi.toggleBookmark as (
        id: string,
        active: boolean,
      ) => Promise<ToggleBookmarkResponse | undefined>,
    ).mockImplementation(async () => {
      posts[0].bookmarkedByMe = true;
      return undefined;
    });
    await runReaction(store, {
      id: "p1",
      type: "post",
      action: "bookmark",
      active: false,
    });
    await vi.waitFor(() =>
      expect(read(bookmarks)?.map((item) => item.id)).toEqual(["p1"]),
    );
  });

  it("keeps post and comment IDs separate", async () => {
    comments = [tweet({ id: "p1", isComment: true, postId: "root" })];
    const arg: PostsQuery = { kind: "comments", postId: "root" };
    await Promise.all([load(), load(arg)]);
    const response = deferred<ToggleLikeResponse>();
    vi.mocked(commentApi.toggleLike).mockReturnValueOnce(response.promise);
    const reaction = runReaction(store, {
      id: "p1",
      type: "comment",
      action: "like",
      active: false,
    });
    expect(read()?.[0].likedByMe).toBe(false);
    expect(read(arg)?.[0].likedByMe).toBe(true);
    comments[0].likedByMe = true;
    comments[0].likesCount = 1;
    response.resolve({ likedByMe: true, likesCount: 1 });
    await reaction;
    expect(tweetApi.toggleLike).not.toHaveBeenCalled();
  });

  it("rolls back voting and does not vote twice or on a closed poll", async () => {
    posts[0].poll = {
      id: "poll",
      options: [
        { id: "a", text: "A", votesCount: 0 },
        { id: "b", text: "B", votesCount: 0 },
      ],
      totalVotes: 0,
      votedOptionId: undefined,
      isClosed: false,
      expiresAt: "2099-01-01T00:00:00Z",
    };
    await load();
    const response = deferred<NonNullable<Tweet["poll"]>>();
    vi.mocked(pollApi.vote).mockReturnValueOnce(response.promise);
    const arg = {
      id: "p1",
      type: "post" as const,
      action: "vote" as const,
      optionId: "a",
      poll: clone(posts[0].poll!),
    };
    const vote = runReaction(store, arg);
    expect(read()?.[0].poll?.totalVotes).toBe(1);
    expect(await runReaction(store, arg)).toBe(false);
    response.reject(new Error("offline"));
    await vote;
    expect(read()?.[0].poll?.votedOptionId).toBeUndefined();
    expect(
      await runReaction(store, {
        ...arg,
        poll: { ...arg.poll, isClosed: true },
      }),
    ).toBe(false);
    expect(pollApi.vote).toHaveBeenCalledTimes(1);
  });

  it("revalidates a query that was in flight while a reaction completed", async () => {
    await load();
    const late = deferred<Tweet[]>();
    vi.mocked(userApi.getPosts).mockReturnValueOnce(late.promise);
    const profile: PostsQuery = {
      kind: "profile",
      username: "alice",
      tab: "posts",
    };
    const loading = load(profile);
    vi.mocked(tweetApi.toggleLike).mockImplementation(async () => {
      posts[0].likedByMe = true;
      posts[0].likesCount = 1;
      return { likedByMe: true, likesCount: 1 };
    });
    await runReaction(store, {
      id: "p1",
      type: "post",
      action: "like",
      active: false,
    });
    late.resolve([tweet()]);
    await loading;
    await vi.waitFor(() => expect(read(profile)?.[0].likedByMe).toBe(true));
  });

  it("creates a post and refreshes empty profile lists without duplicates", async () => {
    const profile: PostsQuery = {
      kind: "profile",
      username: "alice",
      tab: "posts",
    };
    posts = [];
    await Promise.all([load(), load(profile)]);
    vi.mocked(tweetApi.create).mockImplementation(async () => {
      posts = [tweet()];
      return clone(posts[0]);
    });
    await store
      .dispatch(
        postsApi.endpoints.createPost.initiate({
          content: "hello",
          mediaIds: [],
        }),
      )
      .unwrap();
    await vi.waitFor(() =>
      expect(read(profile)?.map((item) => item.id)).toEqual(["p1"]),
    );
    publishPosts(clone(posts), store.dispatch, store.getState());
    expect(read()?.map((item) => item.id)).toEqual(["p1"]);
  });

  it("refreshes replies and parent counters after creating a comment", async () => {
    const arg: PostsQuery = { kind: "comments", postId: "p1" };
    await Promise.all([load(), load(arg)]);
    vi.mocked(commentApi.create).mockImplementation(async () => {
      comments = [tweet({ id: "c1", isComment: true, postId: "p1" })];
      posts[0].repliesCount = 1;
      return clone(comments[0]);
    });
    await store
      .dispatch(
        postsApi.endpoints.createComment.initiate({
          postId: "p1",
          content: "reply",
        }),
      )
      .unwrap();
    await vi.waitFor(() => {
      expect(read(arg)).toHaveLength(1);
      expect(read()?.[0].repliesCount).toBe(1);
    });
  });

  it("removes deleted comment descendants and marks their quotes unavailable", async () => {
    comments = [
      tweet({ id: "c1", isComment: true, postId: "p1", bookmarkedByMe: true }),
      tweet({
        id: "c2",
        isComment: true,
        postId: "p1",
        parentCommentId: "c1",
        bookmarkedByMe: true,
      }),
    ];
    posts.push(
      tweet({
        id: "quote",
        quote: {
          targetType: "comment",
          targetId: "c2",
          targetVersionId: "v1",
          hasNewVersion: false,
          replyingToUsernames: [],
          target: clone(comments[1]),
        },
      }),
    );
    await Promise.all([
      load(),
      load(bookmarks),
      load({ kind: "comments", postId: "p1" }),
    ]);
    vi.mocked(commentApi.delete).mockImplementation(async () => {
      comments = [];
      posts[1].quote!.target = null;
    });
    await store
      .dispatch(
        postsApi.endpoints.deletePost.initiate({ id: "c1", type: "comment" }),
      )
      .unwrap();
    await vi.waitFor(() => expect(read(bookmarks)).toHaveLength(0));
    expect(read()?.[1].quote?.target).toBeNull();
  });

  it("updates a post while preserving the versioned quote snapshot", async () => {
    posts.push(
      tweet({
        id: "quote",
        quote: {
          targetType: "post",
          targetId: "p1",
          targetVersionId: "v1",
          hasNewVersion: false,
          replyingToUsernames: [],
          target: tweet(),
        },
      }),
    );
    await load();
    vi.mocked(tweetApi.update).mockImplementation(async () => {
      posts[0] = { ...posts[0], content: "edited", versionId: "v2" };
      posts[1].quote!.hasNewVersion = true;
      return clone(posts[0]);
    });
    await store
      .dispatch(
        postsApi.endpoints.updatePost.initiate({
          id: "p1",
          type: "post",
          data: { content: "edited" },
        }),
      )
      .unwrap();
    expect(read()?.[0].content).toBe("edited");
    expect(read()?.[1].quote?.hasNewVersion).toBe(true);
    expect(read()?.[1].quote?.target?.content).toBe("hello");
  });

  it("keeps query arguments separate and exposes retryable serializable errors", async () => {
    vi.mocked(commentApi.getThread).mockRejectedValueOnce(new Error("offline"));
    const failed = await store.dispatch(
      postsApi.endpoints.getThread.initiate("p1"),
    );
    expect(failed.error).toEqual({ message: "offline" });
    await store.dispatch(
      postsApi.endpoints.getThread.initiate("p1", { forceRefetch: true }),
    );
    expect(
      postsApi.endpoints.getThread.select("p1")(store.getState()).data?.target
        .id,
    ).toBe("p1");
    const criteria = { query: "a" } as SearchCriteria;
    await load({ kind: "search", criteria, viewer: { followingIds: [] } });
    await load({
      kind: "search",
      criteria: { ...criteria, query: "b" },
      viewer: { followingIds: [] },
    });
    expect(searchApi.posts).toHaveBeenCalledTimes(2);
  });

  it("does not restore old query data after a session change", async () => {
    const old = deferred<Tweet[]>();
    vi.mocked(tweetApi.getFeed).mockReturnValueOnce(old.promise);
    const loading = load();
    store.dispatch(sessionChanged());
    posts = [tweet({ id: "new-account" })];
    await load();
    old.resolve([tweet({ id: "old-account" })]);
    await loading;
    expect(read()?.[0].id).toBe("new-account");
  });

  it("does not apply old mutation patches to a new session", async () => {
    await load();
    const old = deferred<ToggleLikeResponse>();
    vi.mocked(tweetApi.toggleLike).mockReturnValueOnce(old.promise);
    const reaction = runReaction(store, {
      id: "p1",
      type: "post",
      action: "like",
      active: false,
    });
    store.dispatch(sessionChanged());
    await load();
    old.resolve({ likedByMe: true, likesCount: 99 });
    await reaction;
    expect(read()?.[0].likesCount).toBe(0);
  });
});
