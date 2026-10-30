import { describe, expect, it, vi } from "vitest";

import { mockTrends, mockTrendCategories } from "@/mock/data/recommendations";
import { posts } from "@/mock/data/posts";
import { mockSearchApi } from "@/mock/handlers/mockSearchApi";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";
import { MAX_POST_LENGTH } from "@/constants/composer";
import { POLL } from "@/constants/poll";
import { MILLISECONDS_PER_MINUTE } from "@/constants/date";

import { countCharacters, getPostRulesError } from "@/utils/composer/composerRules";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

describe("Explore demonstration data", () => {
  it("fills every category inside the first 20 topics", () => {
    expect(mockTrends).toHaveLength(20);
    for (const category of ["news", "sports", "entertainment"] as const) {
      expect(
        mockTrends.filter((trend) => mockTrendCategories[category].includes(trend.id)),
      ).toHaveLength(5);
    }
    expect(new Set(mockTrends.map((trend) => trend.id)).size).toBe(
      mockTrends.length,
    );
  });

  it("preserves the original posts and adds eleven valid, distinct posts", () => {
    expect(posts).toHaveLength(14);
    expect(posts.slice(0, 3).map((post) => post.id)).toEqual([
      "t1",
      "t2",
      "t3",
    ]);
    expect(new Set(posts.map((post) => post.id)).size).toBe(posts.length);
    expect(new Set(posts.map((post) => post.versionId)).size).toBe(
      posts.length,
    );
    for (const post of posts.slice(3)) {
      expect(countCharacters(post.content)).toBeLessThanOrEqual(
        MAX_POST_LENGTH,
      );
      expect(Number.isFinite(Date.parse(post.createdAt))).toBe(true);
      expect(post.author.id).toBeTruthy();
      expect(
        getPostRulesError({
          content: post.content,
          media: post.attachments,
          poll: post.poll
            ? { options: post.poll.options.map((option) => option.text) }
            : null,
        }),
      ).toBeNull();
    }
  });

  it("provides distinct image attachments, a gallery and HTTPS link previews", () => {
    const attachments = posts.flatMap((post) => post.attachments);
    const previews = posts.flatMap((post) =>
      post.linkPreview ? [post.linkPreview] : [],
    );
    expect(attachments).toHaveLength(5);
    expect(posts.some((post) => post.attachments.length === 2)).toBe(true);
    expect(new Set(attachments.map((attachment) => attachment.id)).size).toBe(
      attachments.length,
    );
    for (const attachment of attachments) {
      expect(attachment.type).toBe("image");
      expect(new URL(attachment.url).protocol).toBe("https:");
      expect(attachment.width).toBeGreaterThan(0);
      expect(attachment.height).toBeGreaterThan(0);
    }
    expect(previews).toHaveLength(2);
    expect(new Set(previews.map((preview) => preview.id)).size).toBe(
      previews.length,
    );
    for (const preview of previews) {
      expect(new URL(preview.url).protocol).toBe("https:");
      expect(new URL(preview.url).hostname).toBe(preview.domain);
      expect(new URL(preview.imageUrl!).protocol).toBe("https:");
      expect(preview.title.trim()).not.toBe("");
    }
  });

  it("seeds votable polls with consistent counts and valid deadlines", () => {
    const pollPosts = posts.filter((post) => post.poll);
    expect(pollPosts).toHaveLength(3);
    expect(new Set(pollPosts.map((post) => post.poll!.id)).size).toBe(pollPosts.length);
    const optionIds = pollPosts.flatMap((post) =>
      post.poll!.options.map((option) => option.id),
    );
    expect(new Set(optionIds).size).toBe(optionIds.length);
    for (const post of pollPosts) {
      const poll = post.poll!;
      expect(post.attachments).toHaveLength(0);
      expect(poll.isClosed).toBe(false);
      expect(poll.votedOptionId).toBeUndefined();
      expect(poll.totalVotes).toBe(
        poll.options.reduce((sum, option) => sum + option.votesCount, 0),
      );
      expect(
        poll.options.every(
          (option) =>
            Number.isInteger(option.votesCount) && option.votesCount >= 0,
        ),
      ).toBe(true);
      const duration =
        (Date.parse(poll.expiresAt!) - Date.parse(post.createdAt)) /
        MILLISECONDS_PER_MINUTE;
      expect(duration).toBeGreaterThanOrEqual(POLL.MIN_DURATION_MINUTES);
      expect(duration).toBeLessThanOrEqual(POLL.MAX_DURATION_MINUTES);
    }
  });

  it("offers three illustrated book covers without adding post attachments", () => {
    const post = posts.find((post) => post.id === "t14")!;
    const options = post.poll!.options;
    expect(post.content).toContain("«Останній сигнал»");
    expect(post.attachments).toHaveLength(0);
    expect(options.map((option) => option.text)).toEqual([
      "Сигнал із лісу",
      "Орбіта мовчання",
      "За межами туманності",
    ]);
    expect(new Set(options.map((option) => option.media?.url)).size).toBe(3);
    for (const option of options) {
      expect(countCharacters(option.text)).toBeLessThanOrEqual(
        POLL.MAX_OPTION_LENGTH,
      );
      expect(option.media?.type).toBe("image");
      expect(new URL(option.media!.url).protocol).toBe("https:");
      expect(option.media?.width).toBeGreaterThan(0);
      expect(option.media?.height).toBeGreaterThan(0);
    }
    const media = posts.flatMap((post) => [
      ...post.attachments,
      ...(post.poll?.options.flatMap((option) =>
        option.media ? [option.media] : [],
      ) ?? []),
    ]);
    expect(new Set(media.map((attachment) => attachment.id)).size).toBe(
      media.length,
    );
  });

  it.each(mockTrends)(
    "finds posts for $title through the existing mock search",
    async (trend) => {
      const posts = await mockSearchApi.posts({
        ...DEFAULT_SEARCH_CRITERIA,
        query: trend.query,
      });
      expect(posts.length).toBeGreaterThan(0);
    },
  );
});
