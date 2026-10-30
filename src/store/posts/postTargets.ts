import type { PostsQuery, Target, Reaction } from "@/types/post";
import type { Post, PostBase } from "@/types/post";

export const targetOf = (post: Pick<Post, "id" | "isComment">): Target => ({
  id: post.id,
  type: post.isComment ? "comment" : "post",
});

export const targetKey = (target: Target) => `${target.type}:${target.id}`;

export const matches = (post: PostBase, target: Target) => targetKey(targetOf(post)) === targetKey(target);

export const entityTag = (target: Target) => ({
  type: "Post" as const,
  id: targetKey(target),
});

export const listTag = (id: string) => ({ type: "List" as const, id });
export const listId = (arg: PostsQuery) =>
  arg.kind === "profile"
    ? `profile:${arg.username}:${arg.tab}`
    : arg.kind === "comments"
      ? `comments:${arg.postId}`
      : arg.kind;

export const reactionKey = (arg: Pick<Reaction, "type" | "id" | "action">) =>
  `${targetKey(arg)}:${arg.action}`;
