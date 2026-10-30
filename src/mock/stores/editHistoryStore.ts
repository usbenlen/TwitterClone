import type {
  EditHistoryResponse,
  Post,
  PostBase,
  QuoteTargetType,
} from "@/features/content/types";

const histories = new Map<string, PostBase[]>();

const keyFor = (targetType: QuoteTargetType, targetId: string) => `${targetType}:${targetId}`;

function cloneSnapshot<T extends PostBase>(post: T): T {
  return structuredClone(post);
}

function ensureInitialVersion(
  targetType: QuoteTargetType,
  post: PostBase,
): PostBase[] {
  const key = keyFor(targetType, post.id);
  const existing = histories.get(key);
  if (existing) return existing;

  const versions = [cloneSnapshot(post)];
  histories.set(key, versions);
  return versions;
}

export const editHistoryStore = {
  recordCreation(targetType: QuoteTargetType, post: PostBase) {
    histories.set(keyFor(targetType, post.id), [cloneSnapshot(post)]);
  },

  recordEdit(
    targetType: QuoteTargetType,
    previous: PostBase,
    updated: PostBase,
  ) {
    const versions = ensureInitialVersion(targetType, previous);
    versions.push(cloneSnapshot(updated));
  },

  getVersion(
    targetType: QuoteTargetType,
    current: Post,
    versionId: string | null | undefined,
  ): PostBase | null {
    const versions = ensureInitialVersion(targetType, current);
    const version = versionId
      ? versions.find((item) => item.versionId === versionId)
      : versions.at(-1);

    return version ? cloneSnapshot(version) : null;
  },

  getHistory(targetType: QuoteTargetType, current: Post): EditHistoryResponse {
    const versions = ensureInitialVersion(targetType, current);

    return {
      targetType,
      targetId: current.id,
      versions: versions.map((version) => cloneSnapshot(version)),
    };
  },

  remove(targetType: QuoteTargetType, targetId: string) {
    histories.delete(keyFor(targetType, targetId));
  },
};
