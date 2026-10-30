import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore } from "@/app/store/store";
import { postApi } from "@/features/content/api/postApi";
import { postsApi } from "@/features/content/api/postQueries";
import { recommendationsApi } from "@/features/discovery/api/recommendationApi";
import { recommendationQueries } from "@/features/discovery/api/recommendationQueries";
import { followApi } from "@/features/profiles/api/followApi";
import { followQueries } from "@/features/profiles/api/followQueries";
import { userApi } from "@/features/profiles/api/profileApi";
import { profileQueries } from "@/features/profiles/api/profileQueries";
import { scheduleQueries } from "@/features/scheduling/api/scheduleQueries";
import { scheduledPostApi } from "@/features/scheduling/api/scheduledPostApi";
import { publishScheduled } from "@/features/scheduling/model/publishScheduled";
import { ApiError } from "@/shared/api/httpClient";
import { appApi } from "@/shared/store/appApi";
import { sessionChanged } from "@/shared/store/session";

import type { Post } from "@/features/content/types/post";
import type { User, UserShort } from "@/features/profiles/types/user";
import type { ScheduledPost } from "@/features/scheduling/types/schedule";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/features/content/api/postApi", () => ({
  postApi: { getFeed: vi.fn() }
}));
vi.mock("@/features/content/api/commentApi", () => ({
  commentApi: {}
}));
vi.mock("@/features/discovery/api/searchApi", () => ({
  searchApi: {}
}));
vi.mock("@/features/content/api/pollApi", () => ({
  pollApi: {}
}));
vi.mock("@/features/profiles/api/profileApi", () => ({
  userApi: { getByUsername: vi.fn() }
}));
vi.mock("@/features/profiles/api/followApi", () => ({
  followApi: {
    following: vi.fn(),
    followers: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
    removeFollower: vi.fn(),
  }
}));
vi.mock("@/features/scheduling/api/scheduledPostApi", () => ({
  scheduledPostApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    publishDue: vi.fn(),
  }
}));
vi.mock("@/features/discovery/api/recommendationApi", () => ({
  recommendationsApi: { trends: vi.fn(), users: vi.fn(), explore: vi.fn(), feedback: vi.fn() }
}));

const ada: UserShort = {
  id: "u2",
  username: "ada",
  displayName: "Ada",
  isVerified: false,
};

const profile: User = {
  ...ada,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  createdAt: "2026-01-01T00:00:00Z",
};

const scheduledPost: ScheduledPost = {
  id: "s1",
  content: "hello",
  mediaIds: [],
  media: [],
  scheduledAt: "2026-10-01T10:00:00Z",
  createdAt: "2026-09-30T10:00:00Z",
};

const publishedPost: Post = {
  id: "p1",
  versionId: "v1",
  content: "published",
  author: ada,
  attachments: [],
  likesCount: 0,
  repliesCount: 0,
  retweetsCount: 0,
  viewsCount: 0,
  likedByMe: false,
  repostedByMe: false,
  bookmarkedByMe: false,
  createdAt: "2026-10-01T10:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("shared RTK Query data", () => {
  it("caches category lists independently and refetches all topic lists after feedback", async () => {
    const store = createAppStore();
    vi.mocked(recommendationsApi.trends).mockResolvedValue({ items: [] });
    vi.mocked(recommendationsApi.explore).mockResolvedValue({ items: [] });
    vi.mocked(recommendationsApi.feedback).mockResolvedValue(undefined);
    const queries = [
      store.dispatch(recommendationQueries.endpoints.getTrends.initiate(4)),
      store.dispatch(recommendationQueries.endpoints.getTrends.initiate(20)),
      store.dispatch(recommendationQueries.endpoints.getExploreTrends.initiate({ category: "news", limit: 3 })),
      store.dispatch(recommendationQueries.endpoints.getExploreTrends.initiate({ category: "sports", limit: 20 })),
    ];
    await Promise.all(queries);
    const feedback = store.dispatch(recommendationQueries.endpoints.sendTrendFeedback.initiate({
      trendId: "hashtag:Київ", reason: "not_interested", source: "sidebar",
    }));
    expect(store.getState().trendFeedback.pending["hashtag:Київ"]).toBe(feedback.requestId);
    await feedback;
    await Promise.all(store.dispatch(appApi.util.getRunningQueriesThunk()));
    expect(recommendationsApi.feedback).toHaveBeenCalledWith({ trendId: "hashtag:Київ", reason: "not_interested" });
    expect(recommendationsApi.trends).toHaveBeenCalledTimes(4);
    expect(recommendationsApi.explore).toHaveBeenCalledTimes(4);
    expect(store.getState().trendFeedback.hidden["hashtag:Київ"]).toBe("not_interested");
    expect(store.getState().trendFeedback.pending).toEqual({});
    queries.forEach((query) => query.unsubscribe());
    store.dispatch(sessionChanged());
  });

  it("rolls back only the failed topic without invalidating other queries", async () => {
    const store = createAppStore();
    vi.mocked(recommendationsApi.feedback).mockImplementation(async ({ trendId }) => {
      if (trendId === "failed") throw new ApiError(429, "Зачекайте", undefined, "30");
    });
    await Promise.all(["failed", "saved"].map((trendId) =>
      store.dispatch(recommendationQueries.endpoints.sendTrendFeedback.initiate({ trendId, reason: "spam", source: "explore" })),
    ));
    expect(store.getState().trendFeedback.hidden).toEqual({ saved: "spam" });
    expect(store.getState().trendFeedback.pending).toEqual({});
    expect(store.getState().trendFeedback.errors).toEqual({ explore: "Не вдалося зберегти відгук. Зачекайте" });
    store.dispatch(sessionChanged());
  });

  it.each(["success", "failure"])("ignores a late feedback %s after the session changes", async (outcome) => {
    const store = createAppStore();
    let finish!: () => void;
    let fail!: (error: Error) => void;
    vi.mocked(recommendationsApi.feedback).mockReturnValueOnce(new Promise<void>((resolve, reject) => {
      finish = resolve;
      fail = reject;
    }));
    const old = store.dispatch(recommendationQueries.endpoints.sendTrendFeedback.initiate({
      trendId: "same", reason: "spam", source: "explore",
    }));
    store.dispatch(sessionChanged());
    vi.mocked(recommendationsApi.feedback).mockResolvedValueOnce(undefined);
    await store.dispatch(recommendationQueries.endpoints.sendTrendFeedback.initiate({
      trendId: "same", reason: "duplicate", source: "sidebar",
    }));
    if (outcome === "success") finish();
    else fail(new Error("Old session"));
    await old;
    await Promise.resolve();
    expect(store.getState().trendFeedback).toEqual({ hidden: { same: "duplicate" }, pending: {}, errors: {} });
    store.dispatch(sessionChanged());
  });

  it("shares recommendation pages and stops when hasMore is false", async () => {
    const store = createAppStore();
    vi.mocked(recommendationsApi.users)
      .mockResolvedValueOnce({
        items: [ada],
        nextCursor: "opaque-next",
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [],
        nextCursor: "unused",
        hasMore: false,
      });
    const first = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    const second = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    await Promise.all([first, second]);
    expect(recommendationsApi.users).toHaveBeenCalledTimes(1);

    await store
      .dispatch(
        recommendationQueries.endpoints.getRecommendedUsers.initiate(4, {
          direction: "forward",
          subscribe: false,
        }),
      )
      .unwrap();
    expect(recommendationsApi.users).toHaveBeenLastCalledWith(4, "opaque-next");
    await store
      .dispatch(
        recommendationQueries.endpoints.getRecommendedUsers.initiate(4, {
          direction: "forward",
          subscribe: false,
        }),
      )
      .unwrap();
    expect(recommendationsApi.users).toHaveBeenCalledTimes(2);
    first.unsubscribe();
    second.unsubscribe();
  });

  it("preserves loaded pages after a failure and retries the same cursor", async () => {
    const store = createAppStore();
    vi.mocked(recommendationsApi.users)
      .mockResolvedValueOnce({
        items: [ada],
        nextCursor: "retry-cursor",
        hasMore: true,
      })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ items: [], nextCursor: null, hasMore: false });
    const query = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    await query;
    const next = () =>
      store.dispatch(
        recommendationQueries.endpoints.getRecommendedUsers.initiate(4, {
          direction: "forward",
          subscribe: false,
        }),
      );
    await expect(next().unwrap()).rejects.toMatchObject({ message: "offline" });
    expect(
      recommendationQueries.endpoints.getRecommendedUsers.select(4)(store.getState()).data
        ?.pages[0].items,
    ).toEqual([ada]);
    await next().unwrap();
    expect(vi.mocked(recommendationsApi.users).mock.calls).toEqual([
      [4, null],
      [4, "retry-cursor"],
      [4, "retry-cursor"],
    ]);
    query.unsubscribe();
  });

  it("refreshes recommendations after successful follow and unfollow", async () => {
    const store = createAppStore();
    let following = false;
    vi.mocked(recommendationsApi.users).mockImplementation(async () => ({
      items: following ? [] : [ada],
      nextCursor: null,
      hasMore: false,
    }));
    vi.mocked(followApi.follow).mockImplementation(async () => {
      following = true;
    });
    vi.mocked(followApi.unfollow).mockImplementation(async () => {
      following = false;
    });
    const query = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    await query;
    const read = () =>
      recommendationQueries.endpoints.getRecommendedUsers.select(4)(store.getState()).data
        ?.pages[0].items;

    await store
      .dispatch(
        followQueries.endpoints.followUser.initiate({ viewerId: "me", user: ada }),
      )
      .unwrap();
    await vi.waitFor(() => expect(read()).toEqual([]));
    await store
      .dispatch(
        followQueries.endpoints.unfollowUser.initiate({
          viewerId: "me",
          user: ada,
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(read()).toEqual([ada]));
    expect(recommendationsApi.users).toHaveBeenCalledTimes(3);
    query.unsubscribe();
  });

  it("does not restore recommendations from a request belonging to the previous session", async () => {
    const store = createAppStore();
    let resolve!: (page: {
      items: UserShort[];
      nextCursor: null;
      hasMore: false;
    }) => void;
    vi.mocked(recommendationsApi.users).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const pending = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    store.dispatch(sessionChanged());
    vi.mocked(recommendationsApi.users).mockResolvedValueOnce({
      items: [],
      nextCursor: null,
      hasMore: false,
    });
    const current = store.dispatch(
      recommendationQueries.endpoints.getRecommendedUsers.initiate(4),
    );
    await current.unwrap();
    resolve({ items: [ada], nextCursor: null, hasMore: false });
    await pending;
    expect(
      recommendationQueries.endpoints.getRecommendedUsers.select(4)(store.getState()).data,
    ).toMatchObject({ pages: [{ items: [] }] });
    pending.unsubscribe();
    current.unsubscribe();
  });

  it("reports a missing trends endpoint as an error and reloads after it becomes available", async () => {
    const store = createAppStore();
    vi.mocked(recommendationsApi.trends)
      .mockRejectedValueOnce(new ApiError(404, "Теми ще недоступні."))
      .mockResolvedValueOnce({ items: [] });
    const query = store.dispatch(recommendationQueries.endpoints.getTrends.initiate(4));
    await query;
    expect(
      recommendationQueries.endpoints.getTrends.select(4)(store.getState()).error,
    ).toMatchObject({ status: 404 });
    expect(
      recommendationQueries.endpoints.getTrends.select(4)(store.getState()).data,
    ).toBeUndefined();
    await query.refetch().unwrap();
    expect(
      recommendationQueries.endpoints.getTrends.select(4)(store.getState()).data,
    ).toEqual({ items: [] });
    query.unsubscribe();
  });

  it("shares follow data and refreshes it after follow and unfollow", async () => {
    const store = createAppStore();

    let following: UserShort[] = [];
    vi.mocked(followApi.following).mockImplementation(async () => [
      ...following,
    ]);
    vi.mocked(followApi.follow).mockImplementation(async () => {
      following = [ada];
    });
    vi.mocked(followApi.unfollow).mockImplementation(async () => {
      following = [];
    });
    vi.mocked(userApi.getByUsername).mockResolvedValue(profile);

    const first = store.dispatch(
      followQueries.endpoints.getFollowing.initiate("me"),
    );
    const second = store.dispatch(
      followQueries.endpoints.getFollowing.initiate("me"),
    );
    const profileQuery = store.dispatch(
      profileQueries.endpoints.getProfile.initiate(ada.username),
    );

    await Promise.all([first, second, profileQuery]);

    expect(followApi.following).toHaveBeenCalledTimes(1);

    await store
      .dispatch(
        followQueries.endpoints.followUser.initiate({ viewerId: "me", user: ada }),
      )
      .unwrap();

    await vi.waitFor(() =>
      expect(
        followQueries.endpoints.getFollowing.select("me")(store.getState()).data,
      ).toEqual([ada]),
    );

    await vi.waitFor(() =>
      expect(userApi.getByUsername).toHaveBeenCalledTimes(2),
    );

    await store
      .dispatch(
        followQueries.endpoints.unfollowUser.initiate({
          viewerId: "me",
          user: ada,
        }),
      )
      .unwrap();

    await vi.waitFor(() =>
      expect(
        followQueries.endpoints.getFollowing.select("me")(store.getState()).data,
      ).toEqual([]),
    );

    await vi.waitFor(() =>
      expect(userApi.getByUsername).toHaveBeenCalledTimes(3),
    );

    first.unsubscribe();
    second.unsubscribe();
    profileQuery.unsubscribe();
  });

  it("refreshes the scheduled list after changes", async () => {
    const store = createAppStore();
    let posts: ScheduledPost[] = [];
    vi.mocked(scheduledPostApi.list).mockImplementation(async () => [...posts]);
    vi.mocked(scheduledPostApi.create).mockImplementation(async () => {
      posts = [scheduledPost];
      return scheduledPost;
    });
    vi.mocked(scheduledPostApi.update).mockImplementation(async () => {
      posts = [{ ...scheduledPost, content: "updated" }];
      return posts[0];
    });
    vi.mocked(scheduledPostApi.delete).mockImplementation(async () => {
      posts = [];
    });

    const query = store.dispatch(
      scheduleQueries.endpoints.getScheduledPosts.initiate(),
    );

    await query;

    const read = () => scheduleQueries.endpoints.getScheduledPosts.select()(store.getState()).data;

    await store
      .dispatch(
        scheduleQueries.endpoints.createScheduledPost.initiate({
          content: "hello",
          mediaIds: [],
          scheduledAt: scheduledPost.scheduledAt,
        }),
      )
      .unwrap();

    await vi.waitFor(() => expect(read()?.[0]?.id).toBe("s1"));

    await store
      .dispatch(
        scheduleQueries.endpoints.updateScheduledPost.initiate({
          id: "s1",
          data: {
            content: "updated",
            mediaIds: [],
            scheduledAt: scheduledPost.scheduledAt,
          },
        }),
      )
      .unwrap();

    await vi.waitFor(() => expect(read()?.[0]?.content).toBe("updated"));

    await store
      .dispatch(scheduleQueries.endpoints.deleteScheduledPost.initiate("s1"))
      .unwrap();

    await vi.waitFor(() => expect(read()).toEqual([]));

    query.unsubscribe();
  });

  it("refreshes both profiles after removing a follower", async () => {
    const store = createAppStore();
    const currentUser: User = {
      ...profile,
      id: "me",
      username: "current-user",
    };
    vi.mocked(userApi.getByUsername).mockImplementation(async (username) =>
      username === currentUser.username ? currentUser : profile,
    );
    vi.mocked(followApi.followers).mockResolvedValue([ada]);
    vi.mocked(followApi.following).mockResolvedValue([currentUser]);
    vi.mocked(followApi.removeFollower).mockResolvedValue();

    const subscriptions = [
      store.dispatch(
        profileQueries.endpoints.getProfile.initiate(currentUser.username),
      ),
      store.dispatch(profileQueries.endpoints.getProfile.initiate(ada.username)),
      store.dispatch(followQueries.endpoints.getFollowers.initiate(currentUser.id)),
      store.dispatch(followQueries.endpoints.getFollowing.initiate(ada.id)),
    ];

    await Promise.all(subscriptions);

    await store
      .dispatch(
        followQueries.endpoints.removeFollower.initiate({
          user: currentUser,
          follower: ada,
        }),
      )
      .unwrap();

    await vi.waitFor(() => {
      expect(userApi.getByUsername).toHaveBeenCalledTimes(4);
      expect(followApi.followers).toHaveBeenCalledTimes(2);
      expect(followApi.following).toHaveBeenCalledTimes(2);
    });
    subscriptions.forEach((subscription) => subscription.unsubscribe());
  });

  it("drops profile data when the session changes", async () => {
    const store = createAppStore();

    vi.mocked(userApi.getByUsername).mockResolvedValue(profile);

    await store.dispatch(profileQueries.endpoints.getProfile.initiate("ada"));

    expect(
      profileQueries.endpoints.getProfile.select("ada")(store.getState()).data?.id,
    ).toBe("u2");

    store.dispatch(sessionChanged());

    await vi.waitFor(() =>
      expect(
        profileQueries.endpoints.getProfile.select("ada")(store.getState()).data,
      ).toBeUndefined(),
    );
  });

  it("publishes due posts into the feed and ignores the previous session", async () => {
    const store = createAppStore();

    let feed: Post[] = [];

    vi.mocked(postApi.getFeed).mockImplementation(async () => [...feed]);

    await store.dispatch(
      postsApi.endpoints.getPosts.initiate({ kind: "feed" }),
    );

    vi.mocked(scheduledPostApi.publishDue).mockImplementationOnce(async () => {
      feed = [publishedPost];
      return [publishedPost];
    });

    await publishScheduled(store);

    expect(
      postsApi.endpoints.getPosts.select({ kind: "feed" })(store.getState())
        .data?.[0]?.id,
    ).toBe("p1");

    let resolve!: (value: Post[]) => void;
    vi.mocked(scheduledPostApi.publishDue).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );

    const pending = publishScheduled(store);

    store.dispatch(sessionChanged());

    resolve([publishedPost]);

    await pending;

    expect(
      postsApi.endpoints.getPosts.select({ kind: "feed" })(store.getState())
        .data,
    ).toBeUndefined();
  });

  it("shows and clears background publishing errors", async () => {
    const store = createAppStore();

    vi.mocked(scheduledPostApi.publishDue)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);

    await publishScheduled(store);

    expect(store.getState().scheduledStatus.error).toBeTruthy();

    await publishScheduled(store);

    expect(store.getState().scheduledStatus.error).toBeNull();
  });
});
