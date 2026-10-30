import { commentApi, pollApi, postApi } from "@/features/content/api";
import { searchApi } from "@/features/discovery/api";
import { userApi } from "@/features/profiles/api";

import type { Post, PostsQuery, Reaction } from "@/features/content/types";

export async function fetchPosts(arg: PostsQuery): Promise<Post[]> {
  switch (arg.kind) {
    case "feed": return postApi.getFeed();
    case "bookmarks": return postApi.getBookmarked();
    case "comments": return commentApi.getByPostId(arg.postId);
    case "search": return searchApi.posts(arg.criteria, arg.viewer);
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

export async function sendReaction(arg: Reaction): Promise<Partial<Post>> {
  const api = arg.type === "comment" ? commentApi : postApi;

  switch (arg.action) {
    case "like": return api.toggleLike(arg.id, arg.active);
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
    case "vote": return { poll: await pollApi.vote(arg.type, arg.id, arg.optionId) };
  }
}
