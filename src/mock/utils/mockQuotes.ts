import type { Post, QuoteTargetType } from "@/features/content/types";

export function markQuotedTargetEdited(
  items: Post[],
  targetType: QuoteTargetType,
  targetId: string,
): Post[] {
  return items.map((item) =>
    item.quote?.targetType === targetType && item.quote.targetId === targetId
      ? {
          ...item,
          quote: {
            ...item.quote,
            hasNewVersion: true,
          },
        }
      : item,
  );
}

export function markQuotedTargetUnavailable(
  items: Post[],
  targetType: QuoteTargetType,
  targetId: string,
): Post[] {
  return items.map((item) =>
    item.quote?.targetType === targetType && item.quote.targetId === targetId
      ? { ...item, quote: { ...item.quote, target: null } }
      : item,
  );
}
