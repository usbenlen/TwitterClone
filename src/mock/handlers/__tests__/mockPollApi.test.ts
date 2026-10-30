// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

async function load() {
  const { pollApi } = await import("@/features/content/api/pollApi");
const { postApi } = await import("@/features/content/api/postApi");
const { commentApi } = await import("@/features/content/api/commentApi");
  const { createAppStore } = await import("@/app/store/store");
  const { postsApi } = await import("@/features/content/api/postQueries");
  const { runReaction } = await import("@/features/content/model/runReaction");
  const { sessionChanged } = await import("@/shared/store/session");
  const posts = await import("@/mock/data/posts");
  const { commentsByPostId } = await import("@/mock/data/comments");
  const data = {
    content: "Питання",
    poll: { options: ["Так", "Ні"], duration: 60 },
    mediaIds: [],
  };
  const post = await postApi.create(data);
  const comment = await commentApi.create({ ...data, postId: post.id });
  return {
    pollApi,
    postApi,
    commentApi,
    postsApi,
    runReaction,
    sessionChanged,
    posts,
    commentsByPostId,
    post,
    comment,
    store: createAppStore(),
  };
}

let backend: Awaited<ReturnType<typeof load>>;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  backend = await load();
});

afterEach(() => {
  backend?.store.dispatch(backend.sessionChanged());
  vi.restoreAllMocks();
});

function target(type: "post" | "comment") {
  return type === "post" ? backend.post : backend.comment;
}

function replacePoll(type: "post" | "comment", poll: typeof backend.post.poll) {
  const item = target(type);
  if (type === "post") {
    backend.posts.setPosts(
      backend.posts.posts.map((post) =>
        post.id === item.id ? { ...post, poll } : post,
      ),
    );
  } else {
    backend.commentsByPostId[backend.post.id] = backend.commentsByPostId[
      backend.post.id
    ].map((comment) =>
      comment.id === item.id ? { ...comment, poll } : comment,
    );
  }
}

describe.each(["post", "comment"] as const)("mock %s poll voting", (type) => {
  it("creates, edits, quotes and votes on image options without losing their media", async () => {
    const { mediaStore } = await import("@/mock/stores/mediaStore");
    const media = mediaStore.add({
      id: "photo",
      type: "image",
      url: "blob:mock-photo",
    });
    const data = {
      content: "Фото?",
      mediaIds: [],
      poll: {
        options: [{ text: "Так 😀", mediaId: media.id }, { text: "Ні" }],
        duration: 60,
      },
    };

    const created =
      type === "post"
        ? await backend.postApi.create(data)
        : await backend.commentApi.create({ ...data, postId: backend.post.id });

    expect(created.attachments).toEqual([]);
    expect(created.poll?.options[0]).toMatchObject({ text: "Так 😀", media });

    const quoted = await backend.postApi.create({
      content: "Цитата",
      mediaIds: [],
      ...(type === "post"
        ? { quotedPostId: created.id }
        : { quotedCommentId: created.id }),
      quotedTargetVersionId: created.versionId,
    });


    expect(quoted.quote?.target?.poll?.options[0].media).toEqual(media);

    const voted = await backend.pollApi.vote(
      type,
      created.id,
      created.poll!.options[0].id,
    );

    expect(voted.options[0].media).toEqual(media);
    expect(voted.options[0].votesCount).toBe(1);

    const updated =
      type === "post"
        ? await backend.postApi.update(created.id, { content: "Оновлено" })
        : await backend.commentApi.update(created.id, { content: "Оновлено" });

    expect(updated.poll?.options[0].media).toEqual(media);

    const withoutPhotos = {
      content: "Без фото",
      poll: { options: ["Так 😀", "Ні"], duration: 60 },
    };

    const removed =
      type === "post"
        ? await backend.postApi.update(created.id, withoutPhotos)
        : await backend.commentApi.update(created.id, withoutPhotos);

    expect(removed.poll?.options[0].media).toBeUndefined();
    expect(quoted.quote?.target?.poll?.options[0].media).toEqual(media);

    mediaStore.remove(media.id);

    await expect(backend.postApi.create(data)).rejects.toThrow("Фото варіанта відповіді не знайдено");
  });
  it("reads live choices rather than a versioned snapshot", async () => {
    const item = target(type);
    expect(await backend.pollApi.get(type, item.id)).toEqual(item.poll);
    const voted = await backend.pollApi.vote(
      type,
      item.id,
      item.poll!.options[0].id,
    );
    expect(await backend.pollApi.get(type, item.id)).toEqual(voted);
    replacePoll(type, undefined);
    expect(await backend.pollApi.get(type, item.id)).toBeNull();
    await expect(backend.pollApi.get(type, "missing")).rejects.toMatchObject({
      status: 404,
    });
  });
  it("uses the real adapter, updates cached lists and threads, and survives another read", async () => {
    const { store, postsApi, post, runReaction } = backend;
    const item = target(type);
    const poll = structuredClone(item.poll!);
    const optionId = poll.options[0].id;
    const vote = vi.spyOn(backend.pollApi, "vote");
    const query =
      type === "post"
        ? { kind: "feed" as const }
        : { kind: "comments" as const, postId: post.id };
    await store.dispatch(postsApi.endpoints.getPosts.initiate(query)).unwrap();
    await store
      .dispatch(postsApi.endpoints.getThread.initiate(post.id))
      .unwrap();

    expect(
      await runReaction(store, {
        type,
        id: item.id,
        action: "vote",
        optionId,
        poll,
      }),
    ).toBe(true);
    expect(vote).toHaveBeenCalledExactlyOnceWith(type, item.id, optionId);
    const expected = {
      ...poll,
      votedOptionId: optionId,
      totalVotes: 1,
      options: poll.options.map((option) => ({
        ...option,
        votesCount: option.id === optionId ? 1 : 0,
      })),
    };
    await vi.waitFor(() => {
      const list = postsApi.endpoints.getPosts.select(query)(
        store.getState(),
      ).data;
      const thread = postsApi.endpoints.getThread.select(post.id)(
        store.getState(),
      ).data;
      expect(list?.find((entry) => entry.id === item.id)?.poll).toEqual(
        expected,
      );
      expect(
        (type === "post"
          ? thread?.target
          : thread?.replies.find((entry) => entry.id === item.id)
        )?.poll,
      ).toEqual(expected);
    });
    const reread =
      type === "post"
        ? await backend.postApi.getById(item.id)
        : (await backend.commentApi.getByPostId(post.id)).find(
            (entry) => entry.id === item.id,
          )!;
    expect(reread.poll).toEqual(expected);
    expect(
      await runReaction(store, {
        type,
        id: item.id,
        action: "vote",
        optionId,
        poll: expected,
      }),
    ).toBe(false);
    expect(vote).toHaveBeenCalledTimes(1);
  });

  it("counts a repeated vote only once and supports polls without a deadline", async () => {
    const item = target(type);
    replacePoll(type, { ...item.poll!, expiresAt: null });
    const first = await backend.pollApi.vote(
      type,
      item.id,
      item.poll!.options[0].id,
    );
    const repeated = await backend.pollApi.vote(
      type,
      item.id,
      item.poll!.options[1].id,
    );
    expect(first).toMatchObject({
      totalVotes: 1,
      votedOptionId: item.poll!.options[0].id,
      expiresAt: null,
    });
    expect(repeated).toEqual(first);
    expect(repeated.options.map((option) => option.votesCount)).toEqual([1, 0]);
  });

  it.each([
    "missing-target",
    "missing-poll",
    "invalid-option",
    "closed",
    "expired",
  ])("rejects %s without changing data", async (reason) => {
    const item = target(type);
    if (reason === "missing-poll") replacePoll(type, undefined);
    if (reason === "closed")
      replacePoll(type, { ...item.poll!, isClosed: true });
    if (reason === "expired")
      replacePoll(type, {
        ...item.poll!,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });
    const beforePosts = structuredClone(backend.posts.posts);
    const beforeComments = structuredClone(backend.commentsByPostId);
    await expect(
      backend.pollApi.vote(
        type,
        reason === "missing-target" ? "missing" : item.id,
        reason === "invalid-option" ? "missing" : item.poll!.options[0].id,
      ),
    ).rejects.toThrow(
      {
        "missing-target": "Пост або коментар не знайдено",
        "missing-poll": "Опитування не знайдено.",
        "invalid-option": "Варіант відповіді не знайдено.",
        closed: "Опитування завершене.",
        expired: "Опитування завершене.",
      }[reason],
    );
    expect(backend.posts.posts).toEqual(beforePosts);
    expect(backend.commentsByPostId).toEqual(beforeComments);
  });
});

it("keeps a post and comment with the same ID separate", async () => {
  const { post, comment, commentsByPostId, pollApi } = backend;
  commentsByPostId[post.id] = [{ ...comment, id: post.id }];
  const votedPost = await pollApi.vote(
    "post",
    post.id,
    post.poll!.options[0].id,
  );
  expect(commentsByPostId[post.id][0].poll?.totalVotes).toBe(0);
  const votedComment = await pollApi.vote(
    "comment",
    post.id,
    comment.poll!.options[1].id,
  );
  expect(votedPost).toMatchObject({
    totalVotes: 1,
    votedOptionId: post.poll!.options[0].id,
  });
  expect(votedComment).toMatchObject({
    totalVotes: 1,
    votedOptionId: comment.poll!.options[1].id,
  });
  expect(
    backend.posts.posts.find((item) => item.id === post.id)?.poll,
  ).toEqual(votedPost);
});
