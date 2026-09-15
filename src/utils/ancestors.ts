import type { Tweet, TweetAncestor } from "@/types/tweet";

export function getAncestorContext(
  ancestors: TweetAncestor[],
  ancestorId: string,
): TweetAncestor[] {
  const index = ancestors.findIndex((ancestor) => ancestor.id === ancestorId);

  if (index <= 0) return [];

  return ancestors.slice(0, index);
}

export function withAncestorContext(
  ancestor: TweetAncestor,
  ancestors: TweetAncestor[],
): Tweet {
  return {
    ...ancestor,
    ancestors: getAncestorContext(ancestors, ancestor.id),
  };
}

export function getAncestorUsernames(tweet: Tweet): string[] {
  const seen = new Set<string>();
  const usernames: string[] = [];

  for (const ancestor of tweet.ancestors ?? []) {
    const username = ancestor.author.username;

    if (!username || seen.has(username)) continue;

    seen.add(username);
    usernames.push(username);
  }

  return usernames;
}

export function getReplyingToUsernames(
  tweet: Tweet,
  replyTo?: Tweet | null,
): string[] {
  const replyTarget = replyTo ?? tweet;
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
      : tweet.ancestors ?? [];

  for (const ancestor of ancestors) addUsername(ancestor.author.username);

  addUsername(replyTarget.replyToUsername);
  addUsername(replyTarget.author.username);

  return usernames;
}

export function getQuoteReplyingToUsernames(tweet: Tweet): string[] {
  const seen = new Set<string>();
  const usernames: string[] = [];

  const addUsername = (username?: string | null) => {
    if (!username || username === tweet.author.username || seen.has(username))
      return;

    seen.add(username);
    usernames.push(username);
  };

  for (const ancestor of tweet.ancestors ?? []) {
    addUsername(ancestor.author.username);
  }

  addUsername(tweet.replyToUsername);

  return usernames;
}

export function getCommentAncestors(
  comment: Tweet,
  rootPost: Tweet | undefined,
  comments: Tweet[],
): TweetAncestor[] {
  const ancestors: TweetAncestor[] = [];

  if (rootPost) ancestors.push(rootPost);

  const commentsMap = new Map(comments.map((item) => [item.id, item]));

  const parentChain: Tweet[] = [];

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
  tweet: Tweet,
  rootPost: Tweet | undefined,
  comments: Tweet[],
): Tweet {
  return {
    ...tweet,
    ancestors: getCommentAncestors(tweet, rootPost, comments),
  };
}

export function getAncestorIds(tweet: Tweet): string[] {
  return (tweet.ancestors ?? []).map((ancestor) => ancestor.id);
}

export function getLatestAncestor(tweet: Tweet): TweetAncestor | null {
  return tweet.ancestors?.at(-1) ?? null;
}

export function getOldestAncestor(tweet: Tweet): TweetAncestor | null {
  return tweet.ancestors?.[0] ?? null;
}

export function hasAncestors(tweet: Tweet): boolean {
  return (tweet.ancestors?.length ?? 0) > 0;
}
