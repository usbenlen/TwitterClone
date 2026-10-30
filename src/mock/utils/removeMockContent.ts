import { commentsByPostId } from "@/mock/data/comments";
import { posts, setPosts } from "@/mock/data/posts";
import { sampleAuthors } from "@/mock/data/users";
import { editHistoryStore } from "@/mock/stores/editHistoryStore";
import { markQuotedTargetUnavailable } from "@/mock/utils/mockQuotes";

// Shared by owner deletion and moderation so threads and quotes stay consistent.
export function removeMockContent(type: "post" | "comment", id: string) {
  const removedComments = new Set<string>();

  if (type === "post") {
    const post = posts.find((item) => item.id === id);
    if (!post) throw new Error("Допис не знайдено.");

    const author = sampleAuthors.find((user) => user.id === post.author.id);
    if (author) author.postsCount = Math.max(0, author.postsCount - 1);

    for (const comment of commentsByPostId[id] ?? []) removedComments.add(comment.id);

    delete commentsByPostId[id];

    setPosts(posts.filter((post) => post.id !== id));
  } else {
    const entry = Object.entries(commentsByPostId).find(([, comments]) =>
      comments.some((comment) => comment.id === id),
    );
    if (!entry) throw new Error("Коментар не знайдено.");

    const [postId, comments] = entry;
    removedComments.add(id);

    let previousSize;
    do {
      previousSize = removedComments.size;

      for (const comment of comments)
        if (comment.parentCommentId && removedComments.has(comment.parentCommentId))
          removedComments.add(comment.id);

    } while (previousSize !== removedComments.size);
    commentsByPostId[postId] = comments.filter(
      (comment) => !removedComments.has(comment.id),
    );

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              repliesCount: Math.max(
                0,
                post.repliesCount - removedComments.size,
              ),
            }
          : post,
      ),
    );

    for (const comment of commentsByPostId[postId])
      comment.repliesCount = commentsByPostId[postId].filter(
        (child) => child.parentCommentId === comment.id,
      ).length;
  }

  const invalidateQuote = (
    targetType: "post" | "comment",
    targetId: string,
  ) => {
    setPosts(markQuotedTargetUnavailable(posts, targetType, targetId));

    for (const [postId, comments] of Object.entries(commentsByPostId))
      commentsByPostId[postId] = markQuotedTargetUnavailable(
        comments,
        targetType,
        targetId,
      );

    editHistoryStore.remove(targetType, targetId);
  };

  if (type === "post") invalidateQuote(type, id);
  for (const commentId of removedComments) invalidateQuote("comment", commentId);
}
