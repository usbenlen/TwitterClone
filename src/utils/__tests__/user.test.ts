import { describe, expect, it } from "vitest";

import type { Post } from "@/types/post";
import type { User } from "@/types/user";

import { toPostAuthor, toUserShort } from "@/utils/postAuthor";
import { updatePostAuthors } from "@/utils/posts/updatePostAuthors";

const user: User = {
  id: "admin",
  username: "admin",
  role: "Admin",
  isVerified: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  createdAt: "2026-10-01T12:00:00Z",
};

function createPost(id: string, author = toPostAuthor(user)): Post {
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
    expect(toPostAuthor(user)).toMatchObject({ role: "Admin", isVerified: false });
    expect(toUserShort(user)).toMatchObject({ role: "Admin", isVerified: false });
  });

  it.each(["Admin", "User", undefined] satisfies User["role"][])(
    "updates role to %s in cached posts, ancestors, and quotes",
    (role) => {
      const post = createPost("post");
      const ancestor = createPost("ancestor");
      const quoted = createPost("quoted");
      const other = createPost("other", {
        id: "reader",
        username: "reader",
        role: "User",
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
      updatePostAuthors([post], { ...user, role, displayName: "Updated" });

      for (const item of [post, ancestor, quoted]) {
        expect(item.author.role).toBe(role);
        expect(item.author.displayName).toBe("Updated");
        expect(item.author.isVerified).toBe(false);
      }
      expect(other.author).toEqual(otherAuthor);
    },
  );
});
