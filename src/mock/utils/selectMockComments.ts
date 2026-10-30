import { commentsByPostId } from "@/mock/data/comments";
import { posts } from "@/mock/data/posts";

import { withAncestors } from "@/utils/posts/ancestors";

import type { Post } from "@/types/post";

export function selectMockComments(predicate: (comment: Post) => boolean): Post[] {
  return Object.entries(commentsByPostId).flatMap(([postId, comments]) => {
    const rootPost = posts.find((post) => post.id === postId);

    return comments.filter(predicate).map((comment) => {
      const reply = withAncestors(
        { ...comment, isComment: true, postId },
        rootPost,
        comments,
      );

      return {
        ...reply,
        replyToUsername: reply.ancestors?.at(-1)?.author.username ?? null,
      };
    });
  });
}
