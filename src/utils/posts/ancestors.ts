import type { Post, PostAncestor } from "@/types/post";

export function getReplyToUsername(post: Post): string | null {
  if (!post.isComment) return null;
  if (post.replyToUsername) return post.replyToUsername;

  const parentId = post.parentCommentId ?? post.postId;
  if (!parentId) return null;

  return post.ancestors?.find(
    (ancestor) =>
      ancestor.id === parentId &&
      Boolean(ancestor.isComment) === Boolean(post.parentCommentId),
  )?.author.username ?? null;
}

export function getAncestorContext(
  ancestors: PostAncestor[],
  ancestorId: string,
): PostAncestor[] {
  const index = ancestors.findIndex((ancestor) => ancestor.id === ancestorId);

  if (index <= 0) return [];

  return ancestors.slice(0, index);
}

export function withAncestorContext(
  ancestor: PostAncestor,
  ancestors: PostAncestor[],
): Post {
  return {
    ...ancestor,
    ancestors: getAncestorContext(ancestors, ancestor.id),
  };
}

export function getReplyingToUsernames(
  post: Post,
  replyTo?: Post | null,
): string[] {
  const replyTarget = replyTo ?? post;
  const seen = new Set<string>();
  const usernames: string[] = [];

  const addUsername = (username?: string | null) => {
    if (!username || seen.has(username)) return;

    seen.add(username);
    usernames.push(username);
  };

  const ancestors =
    replyTarget.ancestors && replyTarget.ancestors.length > 0
      ? replyTarget.ancestors
      : post.ancestors ?? [];

  for (const ancestor of ancestors) addUsername(ancestor.author.username);

  addUsername(replyTarget.replyToUsername);
  addUsername(replyTarget.author.username);

  return usernames;
}

export function getQuoteReplyingToUsernames(post: Post): string[] {
  const seen = new Set<string>();
  const usernames: string[] = [];

  const addUsername = (username?: string | null) => {
    if (!username || username === post.author.username || seen.has(username))
      return;

    seen.add(username);
    usernames.push(username);
  };

  for (const ancestor of post.ancestors ?? []) {
    addUsername(ancestor.author.username);
  }

  addUsername(post.replyToUsername);

  return usernames;
}

export function getCommentAncestors(
  comment: Post,
  rootPost: Post | undefined,
  comments: Post[],
): PostAncestor[] {
  const ancestors: PostAncestor[] = [];

  if (rootPost) ancestors.push(rootPost);

  const commentsMap = new Map(comments.map((item) => [item.id, item]));

  const parentChain: Post[] = [];

  let parentId = comment.parentCommentId ?? null;

  while (parentId) {
    const parent = commentsMap.get(parentId);

    if (!parent) break;

    parentChain.unshift(parent);
    parentId = parent.parentCommentId ?? null;
  }

  ancestors.push(...parentChain);

  return ancestors;
}

export function withAncestors(
  post: Post,
  rootPost: Post | undefined,
  comments: Post[],
): Post {
  return {
    ...post,
    ancestors: getCommentAncestors(post, rootPost, comments),
  };
}
