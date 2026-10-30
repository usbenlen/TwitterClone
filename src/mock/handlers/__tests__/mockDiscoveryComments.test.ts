import { describe, expect, it, vi } from "vitest";

import { getPostRulesError } from "@/features/content/lib/composer/composerRules";
import { commentsByPostId } from "@/mock/data/comments";
import { posts } from "@/mock/data/posts";
import { mockCommentApi } from "@/mock/handlers/mockCommentApi";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

const discussions = [
  ["t4", 3],
  ["t5", 2],
  ["t6", 2],
  ["t7", 3],
  ["t9", 2],
  ["t11", 3],
  ["t14", 4],
] as const;
const newComments = discussions.flatMap(([postId]) => commentsByPostId[postId]);

describe("mock discovery discussions", () => {
  it("adds nineteen comments with distinct identities and preserves the original discussion", () => {
    expect(newComments).toHaveLength(19);
    expect(commentsByPostId.t1.map((comment) => comment.id)).toEqual([
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
    ]);
    const allContent = [...posts, ...Object.values(commentsByPostId).flat()];
    expect(new Set(allContent.map((item) => item.id)).size).toBe(
      allContent.length,
    );
    expect(new Set(allContent.map((item) => item.versionId)).size).toBe(
      allContent.length,
    );
    expect(
      newComments.every((comment) => Number(comment.id.slice(1)) < 100),
    ).toBe(true);
    expect(
      newComments.filter((comment) => comment.parentCommentId),
    ).toHaveLength(5);
    expect(
      newComments.some(
        (comment) =>
          comment.content.endsWith("?") && comment.repliesCount === 0,
      ),
    ).toBe(true);
  });

  it.each(discussions)(
    "keeps %s counts, authors and chronology consistent with its %i comments",
    (postId, count) => {
      const post = posts.find((item) => item.id === postId)!;
      const comments = commentsByPostId[postId];
      expect(comments).toHaveLength(count);
      expect(post.repliesCount).toBe(count);
      for (const comment of comments) {
        const parent = comments.find(
          (item) => item.id === comment.parentCommentId,
        );
        expect(comment.isComment).toBe(true);
        expect(comment.postId).toBe(postId);
        expect(comment.author.id).toBeTruthy();
        expect(comment.replyToUsername).toBe((parent ?? post).author.username);
        if (comment.parentCommentId) expect(parent).toBeDefined();
        expect(comment.repliesCount).toBe(
          comments.filter((item) => item.parentCommentId === comment.id).length,
        );
        const createdAt = Date.parse(comment.createdAt);
        expect(createdAt).toBeGreaterThan(
          Date.parse((parent ?? post).createdAt),
        );
        expect(createdAt).toBeLessThanOrEqual(Date.now());
        expect(
          getPostRulesError({
            content: comment.content,
            media: comment.attachments,
          }),
        ).toBeNull();
      }
    },
  );

  it("includes one HTTPS image and one Kyiv location among otherwise text replies", () => {
    const media = newComments.flatMap((comment) => comment.attachments);
    expect(media).toHaveLength(1);
    expect(media[0].type).toBe("image");
    expect(new URL(media[0].url).protocol).toBe("https:");
    expect(media[0].width).toBeGreaterThan(0);
    expect(media[0].height).toBeGreaterThan(0);
    const allMedia = [...posts, ...newComments].flatMap(
      (item) => item.attachments,
    );
    expect(new Set(allMedia.map((item) => item.id)).size).toBe(allMedia.length);
    const located = newComments.filter((comment) => comment.location);
    expect(located).toHaveLength(1);
    expect(located[0].location).toMatchObject({
      name: "Kyiv",
      country: "Ukraine",
    });
  });

  it.each(discussions)(
    "exposes %s through existing list and thread APIs without flattening parent relationships",
    async (postId) => {
      const comments = commentsByPostId[postId];
      const postThread = await mockCommentApi.getThread(postId);
      expect(postThread.target.repliesCount).toBe(comments.length);
      expect(postThread.replies.map((comment) => comment.id)).toEqual(
        comments
          .filter((comment) => !comment.parentCommentId)
          .map((comment) => comment.id),
      );
      expect(postThread.replies).toHaveLength(2);
      const list = await mockCommentApi.getByPostId(postId);
      expect(list).toHaveLength(comments.length);
      for (const comment of list) {
        const thread = await mockCommentApi.getThread(comment.id);
        const expectedAncestors = comment.parentCommentId
          ? [postId, comment.parentCommentId]
          : [postId];
        expect(thread.ancestors.map((item) => item.id)).toEqual(
          expectedAncestors,
        );
        expect(comment.ancestors?.map((item) => item.id)).toEqual(
          expectedAncestors,
        );
        expect(thread.target.replyToUsername).toBe(
          thread.ancestors.at(-1)?.author.username,
        );
        expect(thread.replies.map((item) => item.id)).toEqual(
          comments
            .filter((item) => item.parentCommentId === comment.id)
            .map((item) => item.id),
        );
      }
    },
  );
});
