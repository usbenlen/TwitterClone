import { useMemo } from "react";

import { usePollVote, usePollCountdown } from "@/hooks/poll";

import { cn } from "@/utils/cn";

import type { TweetPoll as TweetPollType } from "@/types/poll";

interface TweetPollProps {
  tweetId: string;
  poll: TweetPollType;
}

export default function TweetPoll({ poll, tweetId }: TweetPollProps) {
  const { poll: currentPoll, loading, vote } = usePollVote(tweetId, poll);
  const countdown = usePollCountdown(currentPoll.expiresAt);

  const expired = currentPoll.isClosed || countdown.expired;

  const hasVoted = !!currentPoll.votedOptionId;

  const percentages = useMemo<Record<string, number>>(() => {
    if (currentPoll.totalVotes === 0) return {};

    return Object.fromEntries(
      currentPoll.options.map((option) => [
        option.id,
        Math.round((option.votesCount / currentPoll.totalVotes) * 100),
      ]),
    );
  }, [currentPoll]);

  return (
    <div className="mt-3 flex flex-col gap-2">
      {currentPoll.options.map((option) => {
        const percent = percentages[option.id] ?? 0;
        const selected = currentPoll.votedOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            disabled={expired || hasVoted || loading}
            onClick={() => vote(option.id)}
            aria-disabled={expired || hasVoted || loading}
            aria-label={`Голосувати за ${option.text}`}
            className={cn(
              `relative overflow-hidden rounded-xl border px-4 py-3 text-left transition disabled:cursor-default disabled:hover:bg-transparent`,
              selected ? "border-border" : "border-border hover:bg-muted",
            )}
          >
            {(hasVoted || expired) && (
              <div
                className="absolute inset-y-1 left-1 rounded-sm bg-primary/35 transition-all duration-300"
                style={{
                  width: `calc(${percent}% - 8px)`,
                }}
              />
            )}

            {loading && (
              <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[1px]" />
            )}

            <div className="relative z-10 flex items-center justify-between">
              <span className={cn(selected && "font-semibold text-foreground")}>
                {option.text}
              </span>

              {(hasVoted || expired) && (
                <span className="text-sm font-semibold tabular-nums">
                  {percent}%
                </span>
              )}
            </div>
          </button>
        );
      })}

      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <span>{currentPoll.totalVotes} голосів</span>
        <span>·</span>
        <span>{countdown.text}</span>
      </div>
    </div>
  );
}
