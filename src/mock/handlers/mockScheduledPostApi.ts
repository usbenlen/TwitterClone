import { STORAGE_KEYS } from "@/constants/storage";

import { currentUser } from "@/mock/data/users";

import { mockPostApi } from "@/mock/handlers/mockPostApi";

import { mediaStore } from "@/mock/stores/mediaStore";
import { scheduledMediaStore } from "@/mock/stores/scheduledMediaStore";

import { validateMockPost } from "@/mock/utils/validateMockPost";
import { getPostRulesError } from "@/utils/composer/composerRules";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
  MediaAttachment,
  Post,
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

async function hydrate(scheduledPost: StoredScheduledPost): Promise<ScheduledPost> {
  return { ...scheduledPost, media: await resolveMedia(scheduledPost.mediaIds) };
}

async function validateRequest(request: CreateScheduledPostRequest) {
  // Validate uploaded and newly persisted media before changing scheduled storage.
  const media = await Promise.all(
    request.mediaIds.map(async (id) => {
      const uploaded = mediaStore.get(id);
      if (uploaded) return uploaded;

      const pending = request.mockMedia?.find(
        (item) => item.attachmentId === id,
      );
      if (pending) return { type: pending.type };

      const stored = await scheduledMediaStore.get(id);
      if (!stored) throw new Error("Медіавкладення не знайдено.");

      return { type: stored.type };
    }),
  );

  const extras = request as CreateScheduledPostRequest & {
    poll?: unknown;
    location?: unknown;
    quotedPostId?: unknown;
    quotedCommentId?: unknown;
  };

  if (
    extras.poll ||
    extras.location ||
    extras.quotedPostId ||
    extras.quotedCommentId
  )
    throw new Error(
      "Запланований пост не може містити опитування, локацію чи цитату.",
    );

  const error = getPostRulesError({ content: request.content, media });
  if (error) throw new Error(error);
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
    await validateRequest(request);
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

    const index = posts.findIndex((scheduledPost) => scheduledPost.id === id);
    if (index < 0) throw new Error("Запланований допис не знайдено.");

    const previous = posts[index];
    await validateRequest(request);
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
    const target = posts.find((scheduledPost) => scheduledPost.id === id);
    if (!target) return;

    writePosts(posts.filter((scheduledPost) => scheduledPost.id !== id));
    await scheduledMediaStore.removeMany(target.mediaIds);
  },

  async publishDue(): Promise<Post[]> {
    const now = Date.now();
    const due = readPosts().filter(
      (scheduledPost) => new Date(scheduledPost.scheduledAt).getTime() <= now,
    );
    const published: Post[] = [];

    for (const scheduledPost of due) {
      const media = await resolveMedia(scheduledPost.mediaIds);
      if (media.length !== scheduledPost.mediaIds.length) throw new Error("Медіавкладення не знайдено.");

      validateMockPost(scheduledPost.content, media);

      const publishedPost = await mockPostApi.create({
        content: scheduledPost.content,
        mediaIds: scheduledPost.mediaIds,
        linkPreview: scheduledPost.linkPreview,
      });
      published.push(publishedPost);

      writePosts(readPosts().filter((item) => item.id !== scheduledPost.id));
      await scheduledMediaStore.removeMany(scheduledPost.mediaIds);
    }

    return published;
  },
};
