import { commentsByPostId } from "@/mock/data/comments";
import { tweets } from "@/mock/data/tweets";
import { withAncestors } from "@/utils/ancestors";

import type { Tweet } from "@/types";

export function selectMockComments(predicate: (comment: Tweet) => boolean): Tweet[] {
  return Object.entries(commentsByPostId).flatMap(([postId, comments]) => {
    const rootPost = tweets.find((tweet) => tweet.id === postId);

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
