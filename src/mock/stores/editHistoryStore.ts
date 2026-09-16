import type {
  EditHistoryResponse,
  QuoteTargetType,
  Tweet,
  TweetBase,
} from "@/types";

const histories = new Map<string, TweetBase[]>();

const keyFor = (targetType: QuoteTargetType, targetId: string) =>
  `${targetType}:${targetId}`;

function cloneSnapshot<T extends TweetBase>(tweet: T): T {
  return structuredClone(tweet);
}

function ensureInitialVersion(
  targetType: QuoteTargetType,
  tweet: TweetBase,
): TweetBase[] {
  const key = keyFor(targetType, tweet.id);
  const existing = histories.get(key);
  if (existing) return existing;

  const versions = [cloneSnapshot(tweet)];
  histories.set(key, versions);
  return versions;
}

export const editHistoryStore = {
  recordCreation(targetType: QuoteTargetType, tweet: TweetBase) {
    histories.set(keyFor(targetType, tweet.id), [cloneSnapshot(tweet)]);
  },

  recordEdit(
    targetType: QuoteTargetType,
    previous: TweetBase,
    updated: TweetBase,
  ) {
    const versions = ensureInitialVersion(targetType, previous);
    versions.push(cloneSnapshot(updated));
  },

  getVersion(
    targetType: QuoteTargetType,
    current: Tweet,
    versionId: string | null | undefined,
  ): TweetBase | null {
    const versions = ensureInitialVersion(targetType, current);
    const version = versionId
      ? versions.find((item) => item.versionId === versionId)
      : versions.at(-1);

    return version ? cloneSnapshot(version) : null;
  },

  getHistory(targetType: QuoteTargetType, current: Tweet): EditHistoryResponse {
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
