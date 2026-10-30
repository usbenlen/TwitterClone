import type { PostPoll } from "@/features/content/types";

/** Results can be shared only when the choices still mean the same thing */
export function pollsMatch(left: PostPoll, right: PostPoll): boolean {
  return (
    left.id === right.id &&
    left.options.length === right.options.length &&
    left.options.every(
      (option, index) =>
        option.id === right.options[index].id &&
        option.text === right.options[index].text &&
        option.media?.id === right.options[index].media?.id,
    )
  );
}

export function withPollVote(poll: PostPoll, optionId: string): PostPoll {
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

export function canVoteInPoll(poll: PostPoll, optionId: string): boolean {
  return (
    !poll.votedOptionId &&
    !poll.isClosed &&
    (poll.expiresAt === null || Date.parse(poll.expiresAt) > Date.now()) &&
    poll.options.some((option) => option.id === optionId)
  );
}
