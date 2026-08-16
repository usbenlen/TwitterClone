import { useState } from "react";

import { pollApi } from "@/api/poll.api";

import type { TweetPoll } from "@/types/poll";

export function usePollVote(tweetId: string, initialPoll: TweetPoll) {
  const [poll, setPoll] = useState(initialPoll);
  const [loading, setLoading] = useState(false);

  const vote = async (optionId: string) => {
    if (loading || poll.votedOptionId || poll.isClosed) return;

    const previous = poll;

    setLoading(true);

    setPoll((current) => ({
      ...current,

      votedOptionId: optionId,
      totalVotes: current.totalVotes + 1,

      options: current.options.map((option) =>
        option.id === optionId
          ? {
              ...option,

              votesCount: option.votesCount + 1,
            }
          : option,
      ),
    }));

    try {
      const updated = await pollApi.vote(tweetId, optionId);

      setPoll(updated);
    } catch {
      setPoll(previous);
    } finally {
      setLoading(false);
    }
  };

  return {
    poll,
    loading,
    vote,
  };
}
