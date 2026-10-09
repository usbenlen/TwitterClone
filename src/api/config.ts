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
  admin: {
    dashboard: {
      metrics: "admin/dashboard/metrics",
      charts: (period: string) =>
        `admin/dashboard/charts?period=${encodeURIComponent(period)}`,
      tables: (limit: number) => `admin/dashboard/tables?limit=${limit}`,
    },
    users: {
      all: "admin/users",
      byId: (id: string) => `admin/users/${encodeURIComponent(id)}`,
      block: (id: string) => `admin/users/${encodeURIComponent(id)}/block`,
      unblock: (id: string) => `admin/users/${encodeURIComponent(id)}/unblock`,
      delete: (id: string) => `admin/users/${encodeURIComponent(id)}/delete`,
    },
    moderation: {
      all: "admin/moderation",
      byId: (id: string) => `admin/moderation/${encodeURIComponent(id)}`,
      status: (id: string) => `admin/moderation/${encodeURIComponent(id)}/status`,
    },
  },
  auth: {
    login: "auth/login",
    register: "auth/register",
    refresh: "auth/refresh",
    logout: "auth/logout",
    me: "me",

    forgotPassword: "auth/forgot-password",
    verifyResetCode: "auth/verify-reset-code",
    resetPassword: "auth/reset-password",

    changePasswordStart: "me/change-password/start",
    changePasswordConfirm: "me/change-password/confirm",
    verifyEmail: "auth/verify-email",
    resendVerificationCode: "auth/resend-verification-code",
  },
  users: {
    report: (id: string) => `users/${encodeURIComponent(id)}/report`,
    byId: (id: string) => `users/by-id/${encodeURIComponent(id)}`,
    byUsername: (username: string) =>
      `users/by-username/${encodeURIComponent(username)}`,
    posts: (username: string) =>
      `users/${encodeURIComponent(username)}/posts`,
    replies: (username: string) =>
      `users/${encodeURIComponent(username)}/replies`,
    likes: (username: string) =>
      `users/${encodeURIComponent(username)}/likes`,
    reposts: (username: string) =>
      `users/${encodeURIComponent(username)}/reposts`,
    updateProfile: "me",
    deleteMe: "me",
  },
  posts: {
    report: (id: string) => `posts/${encodeURIComponent(id)}/report`,
    feed: "posts/feed",
    myPosts: "me/posts",
    liked: "me/likes",
    bookmarked: "me/bookmarks",
    reposted: "me/reposts",
    byUser: (username: string) =>
      `users/${encodeURIComponent(username)}/posts`,
    byId: (id: string) => `posts/${encodeURIComponent(id)}`,
    editHistory: (id: string) =>
      `posts/${encodeURIComponent(id)}/edit-history`,
    create: "posts",
    update: (id: string) => `posts/${encodeURIComponent(id)}`,
    delete: (id: string) => `posts/${encodeURIComponent(id)}`,

    view: (id: string) => `posts/${encodeURIComponent(id)}/view`,
    like: (id: string) => `posts/${encodeURIComponent(id)}/like`,
    unlike: (id: string) => `posts/${encodeURIComponent(id)}/like`,
    repost: (id: string) => `posts/${encodeURIComponent(id)}/repost`,
    unrepost: (id: string) => `posts/${encodeURIComponent(id)}/repost`,
    bookmark: (id: string) => `posts/${encodeURIComponent(id)}/bookmark`,
    unbookmark: (id: string) => `posts/${encodeURIComponent(id)}/bookmark`,
    scheduled: "posts/scheduled",
    scheduledById: (id: string) =>
      `posts/scheduled/${encodeURIComponent(id)}`,
  },
  comments: {
    report: (id: string) => `comments/${encodeURIComponent(id)}/report`,
    byPost: (postId: string) =>
      `comments/post/${encodeURIComponent(postId)}`,
    thread: (id: string) => `comments/${encodeURIComponent(id)}/thread`,
    editHistory: (id: string) =>
      `comments/${encodeURIComponent(id)}/edit-history`,
    create: "comments",
    update: (id: string) => `comments/${encodeURIComponent(id)}`,
    delete: (id: string) => `comments/${encodeURIComponent(id)}`,

    view: (id: string) => `comments/${encodeURIComponent(id)}/view`,
    like: (id: string) => `comments/${encodeURIComponent(id)}/like`,
    unlike: (id: string) => `comments/${encodeURIComponent(id)}/like`,
    repost: (id: string) => `comments/${encodeURIComponent(id)}/repost`,
    unrepost: (id: string) => `comments/${encodeURIComponent(id)}/repost`,
    bookmark: (id: string) => `comments/${encodeURIComponent(id)}/bookmark`,
    unbookmark: (id: string) => `comments/${encodeURIComponent(id)}/bookmark`,
  },
  poll: {
    vote: (targetType: "post" | "comment", id: string) =>
      `${targetType === "post" ? "posts" : "comments"}/${encodeURIComponent(id)}/poll/vote`,
  },
  search: {
    users: "search/users",
    posts: "search/posts",
    gifs: "search/gifs",
    locations: "search/locations",
  },
  follows: {
    follow: (userId: string) => `follows/${encodeURIComponent(userId)}`,
    unfollow: (userId: string) => `follows/${encodeURIComponent(userId)}`,
    followers: (userId: string) =>
      `follows/${encodeURIComponent(userId)}/followers`,
    following: (userId: string) =>
      `follows/${encodeURIComponent(userId)}/following`,
    removeFollower: (userId: string, followId: string) =>
      `follows/${encodeURIComponent(userId)}/followers/${encodeURIComponent(followId)}`,
  },
  media: {
    upload: "media/upload",
    byId: (id: string) => `media/${encodeURIComponent(id)}`,
  },
  linkPreviews: {
    resolve: "linkpreviews/resolve",
  },
} as const;
