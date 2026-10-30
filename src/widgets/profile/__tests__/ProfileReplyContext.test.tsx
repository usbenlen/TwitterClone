// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore } from "@/app/store/store";
import FeedList from "@/widgets/feed/FeedList";
import Profile from "@/widgets/profile/Profile";
import PostHeader from "@/features/content/components/posts/PostHeader";
import { userApi } from "@/features/profiles/api/profileApi";
import { apiClient } from "@/shared/api/httpClient";
import { sessionChanged } from "@/shared/store/session";
import { commentsByPostId } from "@/mock/data/comments";
import { posts } from "@/mock/data/posts";
import { currentUser, sampleAuthors } from "@/mock/data/users";

import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import type { AppStore } from "@/app/store/store";
import type { Post, ProfileTab } from "@/features/content/types/post";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
vi.mock("@/widgets/profile/ProfileHeader", () => ({
  default: () => null
}));
vi.mock("@/widgets/profile/ProfileHero", () => ({
  default: () => null
}));
vi.mock("@/widgets/profile/ProfileInfo", () => ({
  default: () => null
}));
vi.mock("@/widgets/profile/ProfileStats", () => ({
  default: () => null
}));
vi.mock("@/widgets/profile/ProfileTabs", () => ({
  default: () => null
}));

let store: AppStore;
let root: Root;
let host: HTMLDivElement;
let savedComments: Record<string, Post[]>;

const rootPost = () => structuredClone(posts.find((post) => post.id === "t1")!);
const comment = (id = "c3") => structuredClone(
  commentsByPostId.t1.find((item) => item.id === id)!,
);
const cardWith = (content: string) => Array.from(host.querySelectorAll("article"))
  .find((card) => card.textContent?.includes(content))!;
const recipientLink = (card: Element) => Array.from(card.querySelectorAll("a"))
  .find((link) => link.parentElement?.textContent?.startsWith("Replying to"));

function LocationProbe() {
  const location = useLocation();
  return <output data-location>{location.pathname}</output>;
}

async function render(children: ReactNode) {
  await act(async () => root.render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/dev_user"]}>
        {children}
        <LocationProbe />
      </MemoryRouter>
    </Provider>,
  ));
}

function profile(tab: ProfileTab, items: Post[], own = true) {
  return (
    <Profile
      user={own ? currentUser : sampleAuthors[1]}
      posts={items}
      activeTab={tab}
      isTabLoading={false}
      isOwnProfile={own}
      onUpdateProfile={async () => {}}
    />
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  savedComments = structuredClone(commentsByPostId);
  store = createAppStore();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  host.remove();
  for (const key of Object.keys(commentsByPostId)) delete commentsByPostId[key];
  Object.assign(commentsByPostId, savedComments);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(["likes", "reposts"] as const)("profile %s reply context", (tab) => {
  it.each(["c2", "c3"])("shows the direct recipient for mock comment %s", async (id) => {
    const source = commentsByPostId.t1.find((item) => item.id === id)!;
    source[tab === "likes" ? "likedByMe" : "repostedByMe"] = true;
    const items = await (tab === "likes" ? userApi.getLikes : userApi.getReposts)(currentUser.username);
    await render(profile(tab, items));
    const card = cardWith(source.content);
    const expected = id === "c3" ? comment("c1").author.username : rootPost().author.username;
    const link = recipientLink(card)!;
    expect(link.textContent).toBe(`@${expected}`);
    expect(link.getAttribute("href")).toBe(`/${expected}`);
    if (tab === "reposts") expect(card.textContent).toContain("reposted");
  });

  it("uses server-shaped recipient metadata in another user's profile", async () => {
    const source = { ...comment(), ancestors: undefined, replyToUsername: "server-recipient" };
    await render(profile(tab, [source, rootPost()], false));
    expect(recipientLink(cardWith(source.content))?.textContent).toBe("@server-recipient");
    expect(recipientLink(cardWith(rootPost().content))).toBeUndefined();
  });
});

describe("reply context boundaries and navigation", () => {
  it("enriches seeded reposts in another user's mock profile", async () => {
    const items = await userApi.getReposts(sampleAuthors[1].username);
    await render(profile("reposts", items, false));
    expect(recipientLink(cardWith(comment("c2").content))?.textContent).toBe(
      `@${rootPost().author.username}`,
    );
  });

  it("resolves the immediate ancestor by type and ID when the username is absent", async () => {
    const post = rootPost();
    const parent = { ...comment("c1"), id: post.id };
    const source = { ...comment(), parentCommentId: parent.id, replyToUsername: null, ancestors: [post, parent] };
    await render(profile("likes", [source]));
    expect(recipientLink(cardWith(source.content))?.textContent).toBe(`@${parent.author.username}`);
  });

  it("keeps the recipient focusable and opens their profile without opening the comment", async () => {
    const source = { ...comment(), replyToUsername: "recipient" };
    await render(profile("likes", [source]));
    const link = recipientLink(cardWith(source.content))!;
    act(() => link.focus());
    expect(document.activeElement).toBe(link);
    await act(async () => link.click());
    expect(host.querySelector("[data-location]")?.textContent).toBe("/recipient");
  });

  it.each(["parentCommentId", "postId", "id"] as const)(
    "links unknown recipients to the available %s without fetching context",
    async (target) => {
      const get = vi.spyOn(apiClient, "get");
      const source = {
        ...comment(), replyToUsername: null, ancestors: undefined,
        parentCommentId: target === "parentCommentId" ? "unknown-parent" : null,
        postId: target === "id" ? undefined : "unknown-root",
      };
      await render(profile("likes", [source]));
      const card = cardWith(source.content);
      const link = Array.from(card.querySelectorAll("a")).find((item) => item.textContent === "Відповідь")!;
      expect(link.getAttribute("href")).toBe(`/post/${source[target]}`);
      expect(card.textContent).not.toContain("Replying to");
      await act(async () => link.click());
      expect(host.querySelector("[data-location]")?.textContent).toBe(`/post/${source[target]}`);
      expect(get).not.toHaveBeenCalled();
    },
  );

  it("does not guess a nested recipient from an unrelated root ancestor", async () => {
    const source = { ...comment(), replyToUsername: null, ancestors: [rootPost()] };
    await render(profile("reposts", [source]));
    expect(recipientLink(cardWith(source.content))).toBeUndefined();
    expect(cardWith(source.content).textContent).toContain("Відповідь");
  });

  it.each(["posts", "replies"] as const)("preserves profile %s rendering", async (tab) => {
    const parent = comment("c1");
    const source = { ...comment(), ancestors: [rootPost(), parent] };
    await render(profile(tab, [source]));
    expect(host.textContent).not.toContain("Replying to");
    expect(host.querySelectorAll("article")).toHaveLength(tab === "replies" ? 2 : 1);
    if (tab === "replies") expect(host.textContent).toContain(parent.content);
  });

  it.each(["replies", "bookmarks"] as const)("preserves the %s context layout", async (variant) => {
    const parent = comment("c1");
    const source = { ...comment(), ancestors: [rootPost(), parent] };
    await render(<FeedList posts={[source]} variant={variant} showReplyContext />);
    expect(host.textContent).not.toContain("Replying to");
    expect(host.textContent).toContain(parent.content);
    expect(host.querySelectorAll("article")).toHaveLength(2);
  });

  it("keeps reply context disabled by default in the feed", async () => {
    await render(<FeedList posts={[comment()]} />);
    expect(host.textContent).not.toContain("Replying to");
  });

  it("keeps the existing Ukrainian header label as the default", async () => {
    await render(<PostHeader author={comment().author} createdAt={comment().createdAt} replyToUsername="recipient" />);
    expect(host.textContent).toContain("У відповідь @recipient");
  });
});
