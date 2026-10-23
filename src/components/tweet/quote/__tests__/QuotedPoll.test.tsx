// @vitest-environment happy-dom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pollApi, tweetApi, commentApi } from "@/api";
import { ApiError } from "@/api/client";
import { createAppStore, type AppStore } from "@/store";
import { postsApi } from "@/store/postsApi";
import { runReaction } from "@/store/reactions";
import { sessionChanged } from "@/store/session";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import QuotedPoll from "@/components/tweet/quote/QuotedPoll";
import QuotedTweetCard from "@/components/tweet/quote/QuotedTweetCard";
import { withPollVote } from "@/utils/poll";
import type { Target } from "@/store/posts/types";
import type { Tweet, TweetQuote, TweetPoll as Poll } from "@/types";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

let store: AppStore;
let root: Root;
let container: HTMLDivElement;
let original: Tweet;
let quote: TweetQuote;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
const targetOf = (): Target => ({
  id: original.id,
  type: original.isComment ? "comment" : "post",
});
const queryPoll = () =>
  postsApi.endpoints.getPollState.select(targetOf())(store.getState()).data;
const votingButtons = () => [
  ...container.querySelectorAll<HTMLButtonElement>(
    'button[aria-label^="Голосувати за"]',
  ),
];
const selected = () => container.querySelectorAll('[aria-pressed="true"]');

async function render(children: ReactNode) {
  await act(async () =>
    root.render(
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>,
    ),
  );
  await flush();
}

async function makeQuote() {
  const post = await tweetApi.create({
    content: "Коментар до цитати",
    mediaIds: [],
    ...(original.isComment
      ? { quotedCommentId: original.id }
      : { quotedPostId: original.id }),
    quotedTargetVersionId: original.versionId,
  });
  quote = post.quote!;
}

function copies() {
  return (
    <>
      <TweetPoll
        tweetId={original.id}
        poll={original.poll!}
        isComment={original.isComment}
      />
      <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />
      <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />
    </>
  );
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  store = createAppStore();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  original = await tweetApi.create({
    content: "Збережене питання",
    mediaIds: [],
    poll: { options: ["Так", "Ні"], duration: 60 },
  });
  await makeQuote();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("shared quoted poll state", () => {
  it.each(["post", "comment"] as const)(
    "shows a previous %s vote immediately in a newly mounted quote",
    async (type) => {
      if (type === "comment") {
        original = await commentApi.create({
          postId: original.id,
          content: "Питання в коментарі",
          mediaIds: [],
          poll: { options: ["Так", "Ні"], duration: 60 },
        });
        await makeQuote();
      }
      await runReaction(store, {
        ...targetOf(),
        action: "vote",
        optionId: original.poll!.options[1].id,
        poll: original.poll!,
      });
      // Newly created quotes still contain the versioned snapshot, not live results.
      await makeQuote();
      expect(quote.target!.poll!.votedOptionId).toBeUndefined();
      const get = vi.spyOn(pollApi, "get");
      await render(copies());
      expect(selected()).toHaveLength(3);
      expect(
        [...selected()].every(
          (node) => node.getAttribute("aria-label") === "Ні: 100%, ваш голос",
        ),
      ).toBe(true);
      expect(get).not.toHaveBeenCalled();
    },
  );

  it("deduplicates reads and synchronizes one optimistic quote vote across all copies", async () => {
    const get = vi.spyOn(pollApi, "get");
    await store
      .dispatch(postsApi.endpoints.getPosts.initiate({ kind: "feed" }))
      .unwrap();
    const history = await store
      .dispatch(postsApi.endpoints.getHistory.initiate(targetOf()))
      .unwrap();
    await render(copies());
    expect(get).toHaveBeenCalledExactlyOnceWith("post", original.id);
    const pending = deferred<void>();
    const realVote = pollApi.vote.bind(pollApi);
    const vote = vi
      .spyOn(pollApi, "vote")
      .mockImplementationOnce(async (...args) => {
        await pending.promise;
        return realVote(...args);
      });
    await act(async () => votingButtons()[2].click());
    expect(selected()).toHaveLength(3);
    expect(queryPoll()?.totalVotes).toBe(1);
    expect(
      await runReaction(store, {
        ...targetOf(),
        action: "vote",
        optionId: original.poll!.options[0].id,
        poll: original.poll!,
      }),
    ).toBe(false);
    const feed = postsApi.endpoints.getPosts.select({ kind: "feed" })(
      store.getState(),
    ).data!;
    expect(feed.find((item) => item.id === original.id)?.poll?.totalVotes).toBe(
      1,
    );
    const cachedQuote = feed.find(
      (item) => item.quote?.targetId === original.id,
    )!;
    expect(cachedQuote.quote!.target!.poll!.totalVotes).toBe(1);
    expect(cachedQuote.quote!.target!.content).toBe("Збережене питання");
    await act(async () => pending.resolve());
    await flush();
    expect(vote).toHaveBeenCalledTimes(1);
    expect(selected()).toHaveLength(3);
    expect((await pollApi.get("post", original.id))?.totalVotes).toBe(1);
    expect(history.versions[0].poll!.totalVotes).toBe(0);
  });

  it("rolls back every copy on failure and allows a retry", async () => {
    await render(copies());
    vi.spyOn(pollApi, "vote").mockRejectedValueOnce(new Error("offline"));
    await act(async () => votingButtons()[2].click());
    await flush();
    expect(selected()).toHaveLength(0);
    expect(queryPoll()?.totalVotes).toBe(0);
    expect(votingButtons()).toHaveLength(6);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Спробуйте ще раз",
    );
    await act(async () => votingButtons()[2].click());
    await flush();
    expect(selected()).toHaveLength(3);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("does not replace saved quote choices if the server returns a different poll", async () => {
    await store
      .dispatch(postsApi.endpoints.getPosts.initiate({ kind: "feed" }))
      .unwrap();
    await render(copies());
    const replacement = {
      ...withPollVote(original.poll!, original.poll!.options[0].id),
      id: "replacement",
    };
    vi.spyOn(pollApi, "vote").mockResolvedValueOnce(replacement);
    await act(async () => votingButtons()[2].click());
    await flush();
    expect(container.textContent).toContain("Опитування змінилося");
    const feed = postsApi.endpoints.getPosts.select({ kind: "feed" })(
      store.getState(),
    ).data!;
    const cachedQuote = feed.find(
      (item) => item.quote?.targetId === original.id,
    )!;
    expect(cachedQuote.quote!.target!.poll!.id).toBe(original.poll!.id);
    expect(cachedQuote.quote!.target!.content).toBe("Збережене питання");
  });

  it("does not erase a vote when an older read finishes later", async () => {
    const oldRead = deferred<Poll>();
    vi.spyOn(pollApi, "get").mockReturnValueOnce(oldRead.promise);
    await render(copies());
    expect(votingButtons()).toHaveLength(2); // Only the original can be voted on while quotes load.
    await act(async () => votingButtons()[0].click());
    await flush();
    expect(selected()).toHaveLength(3);
    await act(async () => oldRead.resolve(structuredClone(original.poll!)));
    await flush();
    expect(selected()).toHaveLength(3);
    expect(queryPoll()?.totalVotes).toBe(1);
  });

  it("does not restore state from a previous session's vote", async () => {
    const late = deferred<Poll>();
    vi.spyOn(pollApi, "vote").mockReturnValueOnce(late.promise);
    const vote = runReaction(store, {
      ...targetOf(),
      action: "vote",
      optionId: original.poll!.options[0].id,
      poll: original.poll!,
    });
    store.dispatch(sessionChanged());
    late.resolve(withPollVote(original.poll!, original.poll!.options[0].id));
    await vote;
    expect(queryPoll()).toBeUndefined();
  });

  it("ignores a live read completed after the session has changed", async () => {
    const late = deferred<Poll>();
    vi.spyOn(pollApi, "get").mockReturnValueOnce(late.promise);
    const request = store.dispatch(
      postsApi.endpoints.getPollState.initiate(targetOf()),
    );
    store.dispatch(sessionChanged());
    late.resolve(original.poll!);
    await request;
    expect(queryPoll()).toBeUndefined();
  });

  it.each(["closed", "expired"])(
    "shows results for an unvoted but %s quoted poll",
    async (reason) => {
      const result = withPollVote(original.poll!, original.poll!.options[0].id);
      result.votedOptionId = undefined;
      if (reason === "closed") result.isClosed = true;
      else result.expiresAt = new Date(Date.now() - 1000).toISOString();
      vi.spyOn(pollApi, "get").mockResolvedValueOnce(result);
      await render(
        <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />,
      );
      expect(container.textContent).toContain("Опитування завершене");
      expect(container.textContent).toContain("100%");
      expect(
        [...container.querySelectorAll("button")].every(
          (button) => button.disabled,
        ),
      ).toBe(true);
    },
  );

  it.each([false, true])(
    "keeps composer previews noninteractive (already voted: %s)",
    async (voted) => {
      if (voted)
        await pollApi.vote("post", original.id, original.poll!.options[1].id);
      const vote = vi.spyOn(pollApi, "vote");
      await render(
        <QuotedPoll
          target={targetOf()}
          snapshot={quote.target!.poll!}
          allowVoting={false}
        />,
      );
      expect(
        [...container.querySelectorAll("button")].every(
          (button) => button.disabled,
        ),
      ).toBe(true);
      expect(selected()).toHaveLength(voted ? 1 : 0);
      expect(container.textContent?.includes("100%")).toBe(voted);
      expect(vote).not.toHaveBeenCalled();
    },
  );

  it("keeps history snapshots unchanged and skips live reads", async () => {
    await runReaction(store, {
      ...targetOf(),
      action: "vote",
      optionId: original.poll!.options[0].id,
      poll: original.poll!,
    });
    const get = vi.spyOn(pollApi, "get");
    await render(<QuotedTweetCard quote={quote} readOnly />);
    expect(get).not.toHaveBeenCalled();
    expect(selected()).toHaveLength(0);
    expect(container.textContent).toContain("0 голосів");
    expect(container.textContent).not.toContain("100%");
  });

  it.each(["id", "text", "order"])(
    "blocks voting when the original poll changes its %s",
    async (change) => {
      const poll = structuredClone(original.poll!);
      if (change === "id") poll.id = "replacement";
      if (change === "text") poll.options[0].text = "Інша відповідь";
      if (change === "order") poll.options.reverse();
      vi.spyOn(pollApi, "get").mockResolvedValueOnce(poll);
      await render(
        <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />,
      );
      expect(container.textContent).toContain("Опитування змінилося");
      expect(container.querySelector("a")?.getAttribute("href")).toBe(
        `/post/${original.id}`,
      );
      expect(container.querySelector("button")).toBeNull();
    },
  );

  it.each(["removed", "not-found"])(
    "shows an unavailable state for %s polls",
    async (reason) => {
      const get = vi.spyOn(pollApi, "get");
      if (reason === "removed") get.mockResolvedValueOnce(null);
      else get.mockRejectedValueOnce(new ApiError(404, "missing"));
      await render(
        <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />,
      );
      expect(container.textContent).toBe("Опитування недоступне");
      expect(container.querySelector("button")).toBeNull();
    },
  );

  it("disables a failed preview until its live state is successfully retried", async () => {
    vi.spyOn(pollApi, "get").mockRejectedValueOnce(
      new ApiError(500, "offline"),
    );
    await render(
      <QuotedPoll target={targetOf()} snapshot={quote.target!.poll!} />,
    );
    expect(votingButtons()).toHaveLength(0);
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Спробувати ще раз",
    )!;
    await act(async () => retry.click());
    await flush();
    expect(votingButtons()).toHaveLength(2);
    expect(votingButtons().every((button) => !button.disabled)).toBe(true);
  });
});
