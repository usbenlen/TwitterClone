import type { QuoteTargetType, Tweet } from "@/types";

export function markQuotedTargetEdited(
  items: Tweet[],
  targetType: QuoteTargetType,
  targetId: string,
): Tweet[] {
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
  items: Tweet[],
  targetType: QuoteTargetType,
  targetId: string,
): Tweet[] {
  return items.map((item) =>
    item.quote?.targetType === targetType && item.quote.targetId === targetId
      ? { ...item, quote: { ...item.quote, target: null } }
      : item,
  );
}
