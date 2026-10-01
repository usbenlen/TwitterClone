import { tweetApi, commentApi, userApi, searchApi, pollApi } from "@/api";
import type { Tweet } from "@/types";
import type { PostsQuery, Reaction } from "@/store/posts/types";

export async function fetchPosts(arg: PostsQuery): Promise<Tweet[]> {
  switch (arg.kind) {
    case "feed":
      return tweetApi.getFeed();
    case "bookmarks": {
      const [posts, comments] = await Promise.all([
        tweetApi.getBookmarked(),
        commentApi.getBookmarked(),
      ]);
      return [...posts, ...comments].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    }
    case "comments":
      return commentApi.getByPostId(arg.postId);
    case "search":
      return searchApi.posts(arg.criteria, arg.viewer);
    case "profile": {
      const loaders = {
        posts: userApi.getPosts,
        replies: userApi.getReplies,
        likes: userApi.getLikes,
        reposts: userApi.getReposts,
      };
      return loaders[arg.tab](arg.username);
    }
  }
}

export async function sendReaction(arg: Reaction): Promise<Partial<Tweet>> {
  const api = arg.type === "comment" ? commentApi : tweetApi;
  switch (arg.action) {
    case "like":
      return api.toggleLike(arg.id, arg.active);
    case "repost": {
      const result = await api.toggleRepost(arg.id, arg.active);
      return {
        repostedByMe: result.repostedByMe,
        retweetsCount: result.repostsCount,
      };
    }
    case "bookmark": {
      const result = await api.toggleBookmark(arg.id, arg.active);
      const value =
        result && "isBookmarkedByCurrentUser" in result
          ? Boolean(result.isBookmarkedByCurrentUser)
          : result?.bookmarkedByMe;
      return { bookmarkedByMe: value ?? !arg.active };
    }
    case "vote":
      return { poll: await pollApi.vote(arg.id, arg.optionId) };
  }
}
