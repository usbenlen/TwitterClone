// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PostContent from "@/components/posts/PostContent";
import PostHeader from "@/components/posts/PostHeader";
import { APP_ROUTES } from "@/constants/routes";
import { createAppStore } from "@/store/store";

import type { Post } from "@/types/post";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

const post: Post = {
  id: "display-post",
  versionId: "v1",
  content: "Початок" + " \n \t".repeat(50) + "Кінець 👩‍💻\nhttps://example.com",
  author: {
    id: "author",
    username: "raw   author",
    displayName: "Ім’я\n\n  автора",
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
  createdAt: "2026-10-25T12:00:00Z",
  linkPreview: {
    id: "preview",
    url: "https://example.com",
    domain: "example.com",
    title: "Preview",
    imageUrl: null,
  },
};

describe("post display text", () => {
  it("normalizes post and quote text after removing preview URLs, retaining emoji and source data", async () => {
    const snapshot = structuredClone(post);
    const quoted: Post = {
      ...post,
      quote: {
        targetType: "post",
        targetId: post.id,
        targetVersionId: post.versionId,
        target: post,
        replyingToUsernames: [],
        hasNewVersion: false,
      },
    };
    await act(async () => root.render(
      <Provider store={createAppStore()}>
        <MemoryRouter><PostContent post={quoted} readOnly /></MemoryRouter>
      </Provider>,
    ));

    const blocks = host.querySelectorAll("span[aria-label]");
    expect(blocks).toHaveLength(2);
    for (const block of blocks) {
      expect(block.getAttribute("aria-label")).toBe("Початок\n\nКінець 👩‍💻");
      expect(block.textContent).toBe("Початок\n\nКінець ");
      expect(block.querySelector("img.twemoji")?.getAttribute("alt")).toBe("👩‍💻");
    }
    const authorLink = host.querySelectorAll("a")[2];
    expect(authorLink.textContent).toBe("Ім’я автора");
    expect(authorLink.getAttribute("href")).toBe(APP_ROUTES.profile(post.author.username));
    expect(post).toEqual(snapshot);
  });

  it("normalizes author and reply labels without changing profile links", async () => {
    const recipient = "raw   recipient";
    await act(async () => root.render(
      <Provider store={createAppStore()}>
        <MemoryRouter>
          <PostHeader author={post.author} createdAt={post.createdAt} replyToUsername={recipient} />
        </MemoryRouter>
      </Provider>,
    ));
    const links = host.querySelectorAll("a");
    expect(links[0].textContent).toBe("Ім’я автора");
    expect(links[0].getAttribute("href")).toBe(APP_ROUTES.profile(post.author.username));
    expect(links[1].textContent).toBe("@raw recipient");
    expect(links[1].getAttribute("href")).toBe(APP_ROUTES.profile(recipient));
    expect(host.textContent).toContain("@raw author");
  });
});
