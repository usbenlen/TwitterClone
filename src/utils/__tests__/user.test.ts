import { describe, expect, it } from "vitest";
import type { Tweet, User } from "@/types";
import { toTweetAuthor, toUserShort } from "@/utils/user";
import { updateTweetAuthors } from "@/utils/updateTweetAuthors";

const user: User = {
  id: "admin",
  username: "admin",
  role: "ADMIN",
  isVerified: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  createdAt: "2026-10-01T12:00:00Z",
};

function tweet(id: string, author = toTweetAuthor(user)): Tweet {
  return {
    id,
    versionId: `${id}-v1`,
    content: "hello",
    author,
    attachments: [],
    likesCount: 0,
    repliesCount: 0,
    retweetsCount: 0,
    viewsCount: 0,
    likedByMe: false,
    repostedByMe: false,
    bookmarkedByMe: false,
    createdAt: user.createdAt,
  };
}

describe("user roles in author data", () => {
  it("preserves admin role without marking the user as ordinarily verified", () => {
    expect(toTweetAuthor(user)).toMatchObject({ role: "ADMIN", isVerified: false });
    expect(toUserShort(user)).toMatchObject({ role: "ADMIN", isVerified: false });
  });

  it.each(["ADMIN", "USER", undefined] satisfies User["role"][])(
    "updates role to %s in cached posts, ancestors, and quotes",
    (role) => {
      const post = tweet("post");
      const ancestor = tweet("ancestor");
      const quoted = tweet("quoted");
      const other = tweet("other", {
        id: "reader",
        username: "reader",
        role: "USER",
        isVerified: true,
      });
      post.ancestors = [ancestor, other];
      post.quote = {
        targetType: "comment",
        targetId: quoted.id,
        targetVersionId: quoted.versionId,
        hasNewVersion: false,
        replyingToUsernames: [],
        target: quoted,
      };
      const otherAuthor = { ...other.author };
      updateTweetAuthors([post], { ...user, role, displayName: "Updated" });

      for (const item of [post, ancestor, quoted]) {
        expect(item.author.role).toBe(role);
        expect(item.author.displayName).toBe("Updated");
        expect(item.author.isVerified).toBe(false);
      }
      expect(other.author).toEqual(otherAuthor);
    },
  );
});
