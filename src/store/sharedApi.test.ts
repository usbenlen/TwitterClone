import { beforeEach, describe, expect, it, vi } from "vitest";
import { followApi, scheduledPostApi, tweetApi, userApi } from "@/api";
import type { ScheduledPost, Tweet, User, UserShort } from "@/types";
import { createAppStore } from "./index";
import { postsApi } from "./postsApi";
import { publishScheduled } from "./publishScheduled";
import { sessionChanged } from "./session";
import { sharedApi } from "./sharedApi";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/api", () => ({
  tweetApi: { getFeed: vi.fn() },
  commentApi: {},
  searchApi: {},
  pollApi: {},
  userApi: { getByUsername: vi.fn() },
  followApi: {
    following: vi.fn(),
    followers: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
    removeFollower: vi.fn(),
  },
  scheduledPostApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    publishDue: vi.fn(),
  },
  recommendationsApi: { trends: vi.fn(), users: vi.fn() },
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
const post: ScheduledPost = {
  id: "s1",
  content: "hello",
  mediaIds: [],
  media: [],
  scheduledAt: "2026-10-01T10:00:00Z",
  createdAt: "2026-09-30T10:00:00Z",
};
const tweet: Tweet = {
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
      sharedApi.endpoints.getFollowing.initiate("me"),
    );
    const second = store.dispatch(
      sharedApi.endpoints.getFollowing.initiate("me"),
    );
    const profileQuery = store.dispatch(
      sharedApi.endpoints.getProfile.initiate(ada.username),
    );
    await Promise.all([first, second, profileQuery]);
    expect(followApi.following).toHaveBeenCalledTimes(1);

    await store
      .dispatch(
        sharedApi.endpoints.followUser.initiate({ viewerId: "me", user: ada }),
      )
      .unwrap();
    await vi.waitFor(() =>
      expect(
        sharedApi.endpoints.getFollowing.select("me")(store.getState()).data,
      ).toEqual([ada]),
    );
    await vi.waitFor(() =>
      expect(userApi.getByUsername).toHaveBeenCalledTimes(2),
    );
    await store
      .dispatch(
        sharedApi.endpoints.unfollowUser.initiate({
          viewerId: "me",
          user: ada,
        }),
      )
      .unwrap();
    await vi.waitFor(() =>
      expect(
        sharedApi.endpoints.getFollowing.select("me")(store.getState()).data,
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
      posts = [post];
      return post;
    });
    vi.mocked(scheduledPostApi.update).mockImplementation(async () => {
      posts = [{ ...post, content: "updated" }];
      return posts[0];
    });
    vi.mocked(scheduledPostApi.delete).mockImplementation(async () => {
      posts = [];
    });
    const query = store.dispatch(
      sharedApi.endpoints.getScheduledPosts.initiate(),
    );
    await query;
    const read = () =>
      sharedApi.endpoints.getScheduledPosts.select()(store.getState()).data;
    await store
      .dispatch(
        sharedApi.endpoints.createScheduledPost.initiate({
          content: "hello",
          mediaIds: [],
          scheduledAt: post.scheduledAt,
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(read()?.[0]?.id).toBe("s1"));
    await store
      .dispatch(
        sharedApi.endpoints.updateScheduledPost.initiate({
          id: "s1",
          data: {
            content: "updated",
            mediaIds: [],
            scheduledAt: post.scheduledAt,
          },
        }),
      )
      .unwrap();
    await vi.waitFor(() => expect(read()?.[0]?.content).toBe("updated"));
    await store
      .dispatch(sharedApi.endpoints.deleteScheduledPost.initiate("s1"))
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
        sharedApi.endpoints.getProfile.initiate(currentUser.username),
      ),
      store.dispatch(sharedApi.endpoints.getProfile.initiate(ada.username)),
      store.dispatch(sharedApi.endpoints.getFollowers.initiate(currentUser.id)),
      store.dispatch(sharedApi.endpoints.getFollowing.initiate(ada.id)),
    ];
    await Promise.all(subscriptions);

    await store
      .dispatch(
        sharedApi.endpoints.removeFollower.initiate({
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
    await store.dispatch(sharedApi.endpoints.getProfile.initiate("ada"));
    expect(
      sharedApi.endpoints.getProfile.select("ada")(store.getState()).data?.id,
    ).toBe("u2");
    store.dispatch(sessionChanged());
    await vi.waitFor(() =>
      expect(
        sharedApi.endpoints.getProfile.select("ada")(store.getState()).data,
      ).toBeUndefined(),
    );
  });

  it("publishes due posts into the feed and ignores the previous session", async () => {
    const store = createAppStore();
    let feed: Tweet[] = [];
    vi.mocked(tweetApi.getFeed).mockImplementation(async () => [...feed]);
    await store.dispatch(
      postsApi.endpoints.getPosts.initiate({ kind: "feed" }),
    );
    vi.mocked(scheduledPostApi.publishDue).mockImplementationOnce(async () => {
      feed = [tweet];
      return [tweet];
    });
    await publishScheduled(store);
    expect(
      postsApi.endpoints.getPosts.select({ kind: "feed" })(store.getState())
        .data?.[0]?.id,
    ).toBe("p1");

    let resolve!: (value: Tweet[]) => void;
    vi.mocked(scheduledPostApi.publishDue).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const pending = publishScheduled(store);
    store.dispatch(sessionChanged());
    resolve([tweet]);
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
