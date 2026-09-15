import type { QuoteTargetType, Tweet, TweetBase } from "@/types";

export function updateQuotedTargetInTweets(
  tweets: Tweet[],
  targetType: QuoteTargetType,
  targetId: string,
  target: TweetBase | null,
): Tweet[] {
  return tweets.map((tweet) =>
    tweet.quote?.targetType === targetType && tweet.quote.targetId === targetId
      ? {
          ...tweet,
          quote: {
            ...tweet.quote,
            target: target
              ? {
                  ...target,
                  quote: target.quote
                    ? { ...target.quote, target: null }
                    : null,
                }
              : null,
          },
        }
      : tweet,
  );
}
