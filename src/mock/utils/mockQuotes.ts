import type { QuoteTargetType, Tweet } from "@/types";

export function syncQuotedTarget(
  items: Tweet[],
  targetType: QuoteTargetType,
  target: Tweet,
): Tweet[] {
  return items.map((item) =>
    item.quote?.targetType === targetType && item.quote.targetId === target.id
      ? {
          ...item,
          quote: {
            ...item.quote,
            target: {
              ...target,
              quote: target.quote ? { ...target.quote, target: null } : null,
            },
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
