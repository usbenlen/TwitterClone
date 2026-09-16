import { STORAGE_KEYS } from "@/constants/storage";
import { currentUser } from "@/mock/data";
import { mockTweetApi } from "@/mock/handlers/mockTweetApi";
import { mediaStore } from "@/mock/stores/mediaStore";
import { scheduledMediaStore } from "@/mock/stores/scheduledMediaStore";

import type {
  CreateScheduledPostRequest,
  MediaAttachment,
  ScheduledPost,
  Tweet,
  UpdateScheduledPostRequest,
} from "@/types";

type StoredScheduledPost = Omit<ScheduledPost, "media">;

const storageKey = () => `${STORAGE_KEYS.SCHEDULED_POSTS}:${currentUser.id}`;

function readPosts(): StoredScheduledPost[] {
  try {
    const value = localStorage.getItem(storageKey());
    if (!value) return [];
    const parsed = JSON.parse(value) as StoredScheduledPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePosts(posts: StoredScheduledPost[]) {
  localStorage.setItem(storageKey(), JSON.stringify(posts));
}

async function resolveMedia(ids: string[]): Promise<MediaAttachment[]> {
  const attachments = await Promise.all(
    ids.map(async (id) => {
      const existing = mediaStore.get(id);
      if (existing) return existing;

      const stored = await scheduledMediaStore.get(id);
      if (!stored) return null;

      return mediaStore.add({
        id,
        type: stored.type,
        url: URL.createObjectURL(stored.blob),
        mimeType: stored.mimeType,
        sizeInBytes: stored.sizeInBytes,
      });
    }),
  );

  return attachments.filter(
    (attachment): attachment is MediaAttachment => attachment !== null,
  );
}

async function hydrate(post: StoredScheduledPost): Promise<ScheduledPost> {
  return { ...post, media: await resolveMedia(post.mediaIds) };
}

export const mockScheduledPostApi = {
  async list(): Promise<ScheduledPost[]> {
    const posts = [...readPosts()].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    return Promise.all(posts.map(hydrate));
  },

  async create(request: CreateScheduledPostRequest): Promise<ScheduledPost> {
    const stored: StoredScheduledPost = {
      id: crypto.randomUUID(),
      content: request.content,
      mediaIds: request.mediaIds,
      linkPreview: request.linkPreview,
      scheduledAt: request.scheduledAt,
      createdAt: new Date().toISOString(),
    };

    const media = request.mockMedia ?? [];
    try {
      await Promise.all(media.map((item) => scheduledMediaStore.put(item)));
      writePosts([...readPosts(), stored]);
    } catch (error) {
      await scheduledMediaStore.removeMany(
        media.map((item) => item.attachmentId),
      );
      throw error;
    }

    return hydrate(stored);
  },

  async update(
    id: string,
    request: UpdateScheduledPostRequest,
  ): Promise<ScheduledPost> {
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === id);
    if (index < 0) throw new Error("Запланований допис не знайдено.");

    const previous = posts[index];
    const newMedia = request.mockMedia ?? [];
    const removedMediaIds = previous.mediaIds.filter(
      (mediaId) => !request.mediaIds.includes(mediaId),
    );

    try {
      await Promise.all(newMedia.map((item) => scheduledMediaStore.put(item)));
      posts[index] = {
        ...previous,
        content: request.content,
        mediaIds: request.mediaIds,
        linkPreview: request.linkPreview,
        scheduledAt: request.scheduledAt,
      };
      writePosts(posts);
    } catch (error) {
      await scheduledMediaStore.removeMany(
        newMedia.map((item) => item.attachmentId),
      );
      throw error;
    }

    await scheduledMediaStore.removeMany(removedMediaIds);
    return hydrate(posts[index]);
  },

  async delete(id: string): Promise<void> {
    const posts = readPosts();
    const target = posts.find((post) => post.id === id);
    if (!target) return;

    writePosts(posts.filter((post) => post.id !== id));
    await scheduledMediaStore.removeMany(target.mediaIds);
  },

  async publishDue(): Promise<Tweet[]> {
    const now = Date.now();
    const due = readPosts().filter(
      (post) => new Date(post.scheduledAt).getTime() <= now,
    );
    const published: Tweet[] = [];

    for (const post of due) {
      await resolveMedia(post.mediaIds);
      const tweet = await mockTweetApi.create({
        content: post.content,
        mediaIds: post.mediaIds,
        linkPreview: post.linkPreview,
      });
      published.push(tweet);

      writePosts(readPosts().filter((item) => item.id !== post.id));
      await scheduledMediaStore.removeMany(post.mediaIds);
    }

    return published;
  },
};
