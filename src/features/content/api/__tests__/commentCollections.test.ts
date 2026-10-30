import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore } from "@/app/store/store";
import { commentApi } from "@/features/content/api/commentApi";
import { postsApi } from "@/features/content/api/postQueries";
import { runReaction } from "@/features/content/model/runReaction";
import { sessionChanged } from "@/shared/store/session";
import { commentsByPostId } from "@/mock/data/comments";
import { posts, setPosts } from "@/mock/data/posts";
import { currentUser } from "@/mock/data/users";

import type { AppStore } from "@/app/store/store";
import type { Post, PostsQuery } from "@/features/content/types/post";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

let store: AppStore;
let savedPosts: Post[];
let savedComments: Record<string, Post[]>;

const cases = [
  { action: "bookmark", flag: "bookmarkedByMe", query: { kind: "bookmarks" } },
  {
    action: "like", flag: "likedByMe",
    query: { kind: "profile", username: currentUser.username, tab: "likes" },
  },
  {
    action: "repost", flag: "repostedByMe",
    query: { kind: "profile", username: currentUser.username, tab: "reposts" },
  },
] as const;

const load = (query: PostsQuery) =>
  store.dispatch(postsApi.endpoints.getPosts.initiate(query));
const read = (query: PostsQuery) =>
  postsApi.endpoints.getPosts.select(query)(store.getState()).data!;
const containsComment = (query: PostsQuery, id: string) =>
  read(query).some((item) => item.id === id && item.isComment);

beforeEach(() => {
  savedPosts = structuredClone(posts);
  savedComments = structuredClone(commentsByPostId);
  store = createAppStore();
});

afterEach(() => {
  store.dispatch(sessionChanged());
  vi.restoreAllMocks();
  setPosts(savedPosts);
  for (const key of Object.keys(commentsByPostId)) delete commentsByPostId[key];
  Object.assign(commentsByPostId, savedComments);
});

describe.each(cases)("comment $action collections through mock adapters", ({ action, flag, query }) => {
  it.each(["c2", "c3"])("adds and removes comment %s in an already-open list", async (id) => {
    const source = commentsByPostId.t1.find((item) => item.id === id)!;
    source[flag] = false;
    const comments: PostsQuery = { kind: "comments", postId: "t1" };
    await Promise.all([load(query), load(comments)]);
    expect(containsComment(query, id)).toBe(false);

    expect(await runReaction(store, {
      type: "comment", id, action, active: false,
    })).toBe(true);
    await vi.waitFor(() => expect(containsComment(query, id)).toBe(true));

    const item = read(query).find((entry) => entry.id === id && entry.isComment)!;
    expect(item[flag]).toBe(true);
    expect(item.postId).toBe("t1");
    expect(item.ancestors?.map((ancestor) => ancestor.id)).toEqual(
      id === "c3" ? ["t1", "c1"] : ["t1"],
    );
    expect(item.replyToUsername).toBe(item.ancestors!.at(-1)!.author.username);
    expect(read(comments).find((entry) => entry.id === id)?.[flag]).toBe(true);

    expect(await runReaction(store, {
      type: "comment", id, action, active: true,
    })).toBe(true);
    await vi.waitFor(() => expect(containsComment(query, id)).toBe(false));
    expect(read(comments).find((entry) => entry.id === id)?.[flag]).toBe(false);
  });

  it("keeps a post and comment with the same ID independent", async () => {
    const post = posts.find((item) => item.id === "t1")!;
    post[flag] = true;
    commentsByPostId.t1.push({
      ...structuredClone(commentsByPostId.t1[1]),
      id: post.id, [flag]: false,
    });
    await Promise.all([load(query), load({ kind: "comments", postId: "t1" })]);

    expect(await runReaction(store, {
      type: "comment", id: post.id, action, active: false,
    })).toBe(true);
    await vi.waitFor(() =>
      expect(read(query).filter((item) => item.id === post.id)).toHaveLength(2),
    );
    const pair = read(query).filter((item) => item.id === post.id);
    expect(pair.map((item) => Boolean(item.isComment))).toEqual([false, true]);

    await runReaction(store, { type: "comment", id: post.id, action, active: true });
    await vi.waitFor(() =>
      expect(read(query).filter((item) => item.id === post.id)).toHaveLength(1),
    );
    expect(post[flag]).toBe(true);
    expect(read(query).find((item) => item.id === post.id)?.isComment).not.toBe(true);
  });

  it("rolls back a failed removal without losing the comment", async () => {
    const id = "c3";
    commentsByPostId.t1.find((item) => item.id === id)![flag] = true;
    const comments: PostsQuery = { kind: "comments", postId: "t1" };
    await Promise.all([load(query), load(comments)]);

    let reject!: (error: Error) => void;
    const failure = new Promise<never>((_resolve, no) => { reject = no; });
    const method = action === "like" ? "toggleLike"
      : action === "repost" ? "toggleRepost" : "toggleBookmark";
    vi.spyOn(commentApi, method)
      .mockReturnValueOnce(failure);

    const pending = runReaction(store, { type: "comment", id, action, active: true });
    expect(read(query).find((item) => item.id === id)?.[flag]).toBe(false);
    reject(new Error("offline"));
    expect(await pending).toBe(false);
    await vi.waitFor(() => {
      expect(read(query).find((item) => item.id === id)?.[flag]).toBe(true);
      expect(read(comments).find((item) => item.id === id)?.[flag]).toBe(true);
    });
  });
});
