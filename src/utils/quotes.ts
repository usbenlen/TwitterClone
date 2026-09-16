import type { QuoteTargetType, Tweet } from "@/types";

export function markQuotedTargetEditedInTweets(
  tweets: Tweet[],
  targetType: QuoteTargetType,
  targetId: string,
): Tweet[] {
  return tweets.map((tweet) =>
    tweet.quote?.targetType === targetType && tweet.quote.targetId === targetId
      ? {
          ...tweet,
          quote: {
            ...tweet.quote,
            hasNewVersion: true,
          },
        }
      : tweet,
  );
}

export function markQuotedTargetUnavailableInTweets(
  tweets: Tweet[],
  targetType: QuoteTargetType,
  targetId: string,
): Tweet[] {
  return tweets.map((tweet) =>
    tweet.quote?.targetType === targetType && tweet.quote.targetId === targetId
      ? { ...tweet, quote: { ...tweet.quote, target: null } }
      : tweet,
  );
}
