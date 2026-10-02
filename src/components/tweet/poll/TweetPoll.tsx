import { useMemo, useState } from "react";
import { Check, Clock3, LoaderCircle } from "lucide-react";
import PollCard, { pollRowClassName } from "@/components/tweet/poll/PollCard";

import { usePollVote, usePollCountdown } from "@/hooks";

import { cn } from "@/utils/cn";
import { formatVoteCount } from "@/utils/format";

import type { TweetPoll as TweetPollType } from "@/types/poll";

interface TweetPollProps {
  tweetId: string;
  poll: TweetPollType;
  readOnly?: boolean;
  isComment?: boolean;
}

export default function TweetPoll({
  poll,
  tweetId,
  readOnly = false,
  isComment = false,
}: TweetPollProps) {
  const {
    poll: currentPoll,
    loading,
    vote,
  } = usePollVote(tweetId, poll, isComment);
  const countdown = usePollCountdown(currentPoll.expiresAt);
  const [voteError, setVoteError] = useState<string | null>(null);

  const expired = currentPoll.isClosed || countdown.expired;

  const hasVoted = !!currentPoll.votedOptionId;
  const showResults = readOnly || hasVoted || expired;
  const disabled = readOnly || expired || hasVoted || loading;

  const handleVote = async (optionId: string) => {
    if (disabled) return;
    setVoteError(null);
    if (!(await vote(optionId))) {
      setVoteError("Не вдалося проголосувати. Спробуйте ще раз.");
    }
  };

  const percentages = useMemo<Record<string, number>>(() => {
    if (currentPoll.totalVotes === 0) return {};

    return Object.fromEntries(
      currentPoll.options.map((option) => [
        option.id,
        Math.min(
          100,
          Math.max(
            0,
            Math.round((option.votesCount / currentPoll.totalVotes) * 100),
          ),
        ),
      ]),
    );
  }, [currentPoll]);

  return (
    <PollCard
      busy={loading}
      action={
        loading && (
          <span role="status" className="flex items-center text-primary">
            <LoaderCircle
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Надсилаємо голос</span>
          </span>
        )
      }
      footer={
        <>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="tabular-nums">
              {formatVoteCount(currentPoll.totalVotes)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} className="shrink-0" aria-hidden="true" />
              {expired
                ? "Опитування завершене"
                : `Залишилось ${countdown.text}`}
            </span>
          </div>
          {voteError && !showResults && (
            <p role="alert" className="mt-2 text-destructive">
              {voteError}
            </p>
          )}
        </>
      }
    >
      {currentPoll.options.map((option) => {
        const percent = percentages[option.id] ?? 0;
        const selected = currentPoll.votedOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => void handleVote(option.id)}
            aria-pressed={showResults ? selected : undefined}
            aria-label={
              showResults
                ? `${option.text}: ${percent}%${selected ? ", ваш голос" : ""}`
                : `Голосувати за ${option.text}`
            }
            className={cn(
              pollRowClassName,
              "relative w-full overflow-hidden text-left disabled:cursor-default",
              !disabled && "hover:border-primary/50 hover:bg-primary/5",
              selected && "border-primary/50",
              loading && "opacity-60",
            )}
          >
            {showResults && (
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 transition-[width] duration-300 motion-reduce:transition-none",
                  selected ? "bg-primary/20" : "bg-muted",
                )}
                style={{ width: `${percent}%` }}
              />
            )}

            <div className="relative flex min-w-0 items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 wrap-anywhere whitespace-pre-wrap",
                  selected && "font-semibold",
                )}
              >
                {option.text}
              </span>

              {showResults && (
                <span className="flex shrink-0 items-center gap-1.5 font-semibold tabular-nums">
                  {selected && (
                    <Check
                      size={15}
                      className="text-primary"
                      aria-hidden="true"
                    />
                  )}
                  {percent}%
                </span>
              )}
            </div>
          </button>
        );
      })}
    </PollCard>
  );
}
