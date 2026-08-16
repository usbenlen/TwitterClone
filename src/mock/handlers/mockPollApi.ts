import { delay } from "@/mock/utils/delay";

import { tweets, setTweets } from "@/mock/data/tweets";

export const mockPollApi = {
  async vote(tweetId: string, optionId: string) {
    await delay(200);

    const updatedTweets = tweets.map((tweet) => {
      if (tweet.id !== tweetId || !tweet.poll) return tweet;

      if (tweet.poll.votedOptionId) return tweet;

      return {
        ...tweet,

        poll: {
          ...tweet.poll,

          votedOptionId: optionId,
          totalVotes: tweet.poll.totalVotes + 1,

          options: tweet.poll.options.map((option) =>
            option.id === optionId
              ? {
                  ...option,

                  votesCount: option.votesCount + 1,
                }
              : option,
          ),
        },
      };
    });

    setTweets(updatedTweets);

    return updatedTweets.find((t) => t.id === tweetId)!.poll!;
  },
};
