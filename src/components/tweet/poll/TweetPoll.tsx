import { useMemo, useState } from "react";
import { Check, Clock3, LoaderCircle } from "lucide-react";

import PollCard from "@/components/tweet/poll/PollCard";

import { usePollVote, usePollCountdown } from "@/hooks";

import { cn } from "@/utils/cn";
import { formatVoteCount } from "@/utils/format";

import type { TweetPoll as TweetPollType } from "@/types/poll";

interface TweetPollProps {
  tweetId: string;
  poll: TweetPollType;
  readOnly?: boolean;
  isComment?: boolean;
  allowVoting?: boolean;
}

export default function TweetPoll({
  poll,
  tweetId,
  readOnly = false,
  isComment = false,
  allowVoting = true,
}: TweetPollProps) {
  const {
    poll: currentPoll,
    loading,
    vote,
  } = usePollVote(tweetId, poll, isComment, readOnly);
  const countdown = usePollCountdown(currentPoll.expiresAt);
  const [voteError, setVoteError] = useState<string | null>(null);

  const expired = currentPoll.isClosed || countdown.expired;

  const hasVoted = !!currentPoll.votedOptionId;
  const showResults = readOnly || hasVoted || expired;
  const disabled = !allowVoting || readOnly || expired || hasVoted || loading;

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
  const leadingVotes = Math.max(
    ...currentPoll.options.map((option) => option.votesCount),
  );

  return (
    <PollCard
      variant="display"
      busy={loading}
      action={
        loading && (
          <span role="status" className="mb-2 flex items-center text-primary">
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
                : countdown.hasDeadline
                  ? `Залишилось ${countdown.text}`
                  : "Без обмеження часу"}
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
        const leading = option.votesCount > 0 && option.votesCount === leadingVotes;

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
                : `${allowVoting ? "Голосувати за" : "Варіант"} ${option.text}`
            }
            className={cn(
              "w-full min-w-0 text-sm transition-colors focus-visible:focus-indicator disabled:cursor-default",
              showResults
                ? "grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3 text-left"
                : "min-h-11 rounded-sm px-4 py-2 font-semibold text-primary inset-ring inset-ring-primary/60",
              !disabled && "hover:bg-primary/10 active:bg-primary/20",
              loading && "opacity-60",
            )}
          >
            <span
              className={cn(
                "relative flex min-w-0 items-center gap-2",
                showResults && "min-h-9 px-3 py-2",
              )}
            >
              {showResults && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-md transition-[width] duration-300 motion-reduce:transition-none",
                    leading ? "bg-primary/35" : "bg-muted-foreground/25",
                  )}
                  style={{ width: `${percent}%` }}
                />
              )}
              <span
                className={cn(
                  "relative min-w-0 wrap-anywhere whitespace-pre-wrap",
                  leading && showResults && "font-semibold",
                )}
              >
                {option.text}
              </span>
              {showResults && selected && (
                <Check
                  size={15}
                  className="relative shrink-0 text-foreground"
                  aria-hidden="true"
                />
              )}
            </span>
            {showResults && (
              <span
                className={cn(
                  "text-right tabular-nums",
                  leading && "font-bold",
                )}
              >
                {percent}%
              </span>
            )}
          </button>
        );
      })}
    </PollCard>
  );
}
