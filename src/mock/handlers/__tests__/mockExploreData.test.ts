import { describe, expect, it, vi } from "vitest";

import { mockTrends, tweets } from "@/mock/data";
import { mockSearchApi } from "@/mock/handlers/mockSearchApi";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";
import { MAX_TWEET_LENGTH } from "@/constants/app";
import { POLL } from "@/constants/poll";
import { MILLISECONDS_PER_MINUTE } from "@/constants/date";
import { filterExploreTrends } from "@/utils/explore";
import { countCharacters, getPostRulesError } from "@/utils/composerRules";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));

describe("Explore demonstration data", () => {
  it("fills every category inside the first 20 topics", () => {
    expect(mockTrends).toHaveLength(20);
    for (const category of ["news", "sports", "entertainment"] as const) {
      expect(
        filterExploreTrends(mockTrends.slice(0, 20), category),
      ).toHaveLength(5);
    }
    expect(new Set(mockTrends.map((trend) => trend.id)).size).toBe(
      mockTrends.length,
    );
  });

  it("preserves the original posts and adds ten valid, distinct posts", () => {
    expect(tweets).toHaveLength(13);
    expect(tweets.slice(0, 3).map((post) => post.id)).toEqual([
      "t1",
      "t2",
      "t3",
    ]);
    expect(new Set(tweets.map((post) => post.id)).size).toBe(tweets.length);
    expect(new Set(tweets.map((post) => post.versionId)).size).toBe(
      tweets.length,
    );
    for (const post of tweets.slice(3)) {
      expect(countCharacters(post.content)).toBeLessThanOrEqual(
        MAX_TWEET_LENGTH,
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
    const attachments = tweets.flatMap((post) => post.attachments);
    const previews = tweets.flatMap((post) =>
      post.linkPreview ? [post.linkPreview] : [],
    );
    expect(attachments).toHaveLength(5);
    expect(tweets.some((post) => post.attachments.length === 2)).toBe(true);
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
    const posts = tweets.filter((post) => post.poll);
    expect(posts).toHaveLength(2);
    expect(new Set(posts.map((post) => post.poll!.id)).size).toBe(posts.length);
    const optionIds = posts.flatMap((post) =>
      post.poll!.options.map((option) => option.id),
    );
    expect(new Set(optionIds).size).toBe(optionIds.length);
    for (const post of posts) {
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
