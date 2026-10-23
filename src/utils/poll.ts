import type { TweetPoll } from "@/types/poll";

/** Results can be shared only when the choices still mean the same thing */
export function pollsMatch(left: TweetPoll, right: TweetPoll): boolean {
  return (
    left.id === right.id &&
    left.options.length === right.options.length &&
    left.options.every(
      (option, index) =>
        option.id === right.options[index].id &&
        option.text === right.options[index].text,
    )
  );
}

export function withPollVote(poll: TweetPoll, optionId: string): TweetPoll {
  return {
    ...poll,
    votedOptionId: optionId,
    totalVotes: poll.totalVotes + 1,
    options: poll.options.map((option) =>
      option.id === optionId
        ? { ...option, votesCount: option.votesCount + 1 }
        : option,
    ),
  };
}

export function canVoteInPoll(poll: TweetPoll, optionId: string): boolean {
  return (
    !poll.votedOptionId &&
    !poll.isClosed &&
    (poll.expiresAt === null || Date.parse(poll.expiresAt) > Date.now()) &&
    poll.options.some((option) => option.id === optionId)
  );
}
