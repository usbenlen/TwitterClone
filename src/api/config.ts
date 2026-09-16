/**
 * Формує базову адресу до API з .env змінних.
 * VITE_PATH_TO_SERVER + VITE_PATH_TO_API, напр:
 *   https://localhost:7001/ + api/  =>  https://localhost:7001/api/
 */

function buildApiBaseUrl(): string {
  const server = import.meta.env.VITE_PATH_TO_SERVER ?? "";
  const apiPath = import.meta.env.VITE_PATH_TO_API ?? "";
  // Прибирання подвійних слешів на стику
  return `${server.replace(/\/+$/, "")}/${apiPath.replace(/^\/+/, "")}`.replace(
    /\/+$/,
    "/",
  );
}

export const API_BASE_URL = buildApiBaseUrl();

// Ендпоінти API. Тут зібрано всі шляхи, щоб не дублювати рядки
export const ENDPOINTS = {
  auth: {
    login: "auth/login",
    register: "auth/register",
    refresh: "auth/refresh",
    logout: "auth/logout",
    me: "me",

    forgotPassword: "auth/forgot-password",
    verifyResetCode: "auth/verify-reset-code",
    resetPassword: "auth/reset-password",

    changePassword: "me/change-password",
    verifyEmail: "auth/verify-email",
    resendVerificationCode: "auth/resend-verification-code",
  },
  users: {
    all: "users",
    byId: (id: string) => `users/by-id/${id}`,
    byUsername: (username: string) => `users/by-username/${username}`,
    posts: (username: string) => `users/${username}/posts`,
    replies: (username: string) => `users/${username}/replies`,
    likes: (username: string) => `users/${username}/likes`,
    reposts: (username: string) => `users/${username}/reposts`,
    updateProfile: "me",
    deleteMe: "me",
  },
  posts: {
    all: "posts",
    feed: "posts/feed",
    myPosts: "me/posts",
    liked: "me/likes",
    bookmarked: "me/bookmarks",
    reposted: "me/reposts",
    byUser: (username: string) => `users/${username}/posts`,
    byId: (id: string) => `posts/${id}`,
    editHistory: (id: string) => `posts/${id}/edit-history`,
    create: "posts",
    update: (id: string) => `posts/${id}`,
    delete: (id: string) => `posts/${id}`,

    view: (id: string) => `posts/${id}/view`,
    like: (id: string) => `posts/${id}/like`,
    unlike: (id: string) => `posts/${id}/like`,
    repost: (id: string) => `posts/${id}/repost`,
    unrepost: (id: string) => `posts/${id}/repost`,
    bookmark: (id: string) => `posts/${id}/bookmark`,
    unbookmark: (id: string) => `posts/${id}/bookmark`,
  },
  comments: {
    byPost: (postId: string) => `comments/post/${postId}`,
    thread: (id: string) => `comments/${id}/thread`,
    editHistory: (id: string) => `comments/${id}/edit-history`,
    bookmarked: "comments/bookmarked",
    create: "comments",
    update: (id: string) => `comments/${id}`,
    delete: (id: string) => `comments/${id}`,

    view: (id: string) => `comments/${id}/view`,
    like: (id: string) => `comments/${id}/like`,
    unlike: (id: string) => `comments/${id}/like`,
    repost: (id: string) => `comments/${id}/repost`,
    unrepost: (id: string) => `comments/${id}/repost`,
    bookmark: (id: string) => `comments/${id}/bookmark`,
    unbookmark: (id: string) => `comments/${id}/bookmark`,
  },
  poll: {
    vote: (postId: string) => `posts/${postId}/poll/vote`,
  },
  search: {
    users: "search/users",
    posts: "search/posts",
    gifs: "search/gifs",
    locations: "search/locations",
  },
  follows: {
    follow: (userId: string) => `follows/${userId}`,
    unfollow: (userId: string) => `follows/${userId}`,
    followers: (userId: string) => `follows/${userId}/followers`,
    following: (userId: string) => `follows/${userId}/following`,
    removeFollower: (userId: string, followId: string) =>
      `follows/${userId}/followers/${followId}`,
  },
  media: {
    upload: "media/upload",
    byId: (id: string) => `media/${id}`,
  },
  linkPreviews: {
    resolve: "link-previews/resolve",
  },
} as const;
