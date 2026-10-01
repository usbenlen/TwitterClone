import type {
  Tweet,
  TweetBase,
  SearchCriteria,
  SearchViewerContext,
} from "@/types";

export type ProfileTab = "posts" | "replies" | "likes" | "reposts";
export type PostsQuery =
  | { kind: "feed" | "bookmarks" }
  | { kind: "comments"; postId: string }
  | { kind: "profile"; username: string; tab: ProfileTab }
  | { kind: "search"; criteria: SearchCriteria; viewer: SearchViewerContext };

export interface Target {
  id: string;
  type: "post" | "comment";
}

export const targetOf = (tweet: Pick<Tweet, "id" | "isComment">): Target => ({
  id: tweet.id,
  type: tweet.isComment ? "comment" : "post",
});
export const targetKey = (target: Target) => `${target.type}:${target.id}`;
export const matches = (tweet: TweetBase, target: Target) =>
  targetKey(targetOf(tweet)) === targetKey(target);
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

export type Reaction = Target &
  (
    | { action: "like" | "repost" | "bookmark"; active: boolean }
    | { action: "vote"; optionId: string; poll: NonNullable<Tweet["poll"]> }
  );
export const reactionKey = (arg: Pick<Reaction, "type" | "id" | "action">) =>
  `${targetKey(arg)}:${arg.action}`;
