import { useEffect, useId, type RefObject } from "react";
import { Clock3, Plus, X } from "lucide-react";
import { POLL } from "@/constants/poll";
import { countCharacters, getPollError } from "@/utils/composerRules";
import PollCard, { pollRowClassName } from "@/components/tweet/poll/PollCard";
import { cn } from "@/utils/cn";
import type { ComposerPoll } from "@/types/poll";

interface PollComposerProps {
  poll: ComposerPoll;
  firstOptionRef: RefObject<HTMLInputElement | null>;
  isValid: boolean;
  disabled?: boolean;
  onOptionChange: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onDurationChange: (minutes: number) => void;
  onRemove: () => void;
}

export default function PollComposer({
  poll,
  firstOptionRef,
  isValid,
  disabled = false,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onDurationChange,
  onRemove,
}: PollComposerProps) {
  const id = useId();
  const days = Math.floor(poll.duration / 1440);
  const hours = Math.floor((poll.duration % 1440) / 60);
  const minutes = poll.duration % 60;
  const error = getPollError(
    poll.options.map((option) => option.text),
    poll.duration,
  );
  const durationFields = [
    {
      key: "days",
      label: "Дні",
      value: days,
      max: 7,
      onChange: (value: number) =>
        onDurationChange(
          value === 7
            ? POLL.MAX_DURATION_MINUTES
            : value * 1440 + hours * 60 + minutes,
        ),
    },
    {
      key: "hours",
      label: "Години",
      value: hours,
      max: 23,
      onChange: (value: number) =>
        onDurationChange(days * 1440 + value * 60 + minutes),
    },
    {
      key: "minutes",
      label: "Хвилини",
      value: minutes,
      max: 59,
      onChange: (value: number) =>
        onDurationChange(days * 1440 + hours * 60 + value),
    },
  ];
  useEffect(() => {
    firstOptionRef.current?.focus();
  }, [firstOptionRef]);

  return (
    <PollCard
      busy={disabled}
      action={
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Видалити опитування"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
        >
          <X size={17} aria-hidden="true" />
        </button>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" />
            Тривалість
          </span>
          <div className="flex flex-wrap gap-2">
            {durationFields.map((field) => (
              <label
                key={field.key}
                className="flex flex-col gap-1 text-xs"
                htmlFor={`${id}-${field.key}`}
              >
                {field.label}
                <select
                  id={`${id}-${field.key}`}
                  value={field.value}
                  disabled={disabled || (days === 7 && field.key !== "days")}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                  aria-describedby={error ? `${id}-hint` : undefined}
                  className="min-h-9 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
                >
                  {Array.from({ length: field.max + 1 }, (_, value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      }
    >
      {poll.options.map((option, index) => (
        <div key={option.id} className="flex min-w-0 items-center gap-1.5">
          <label htmlFor={`${id}-${option.id}`} className="sr-only">
            Варіант {index + 1}
          </label>
          <div className="min-w-0 flex-1">
            <input
              id={`${id}-${option.id}`}
              ref={index === 0 ? firstOptionRef : undefined}
              value={option.text}
              disabled={disabled}
              onChange={(event) =>
                onOptionChange(option.id, event.target.value)
              }
              placeholder={`Варіант ${index + 1}`}
              aria-describedby={!isValid ? `${id}-hint` : undefined}
              aria-invalid={
                countCharacters(option.text.trim()) > POLL.MAX_OPTION_LENGTH ||
                undefined
              }
              className={cn(
                pollRowClassName,
                "w-full flex-1 placeholder:text-muted-foreground focus-visible:border-primary disabled:opacity-50",
              )}
            />
            <span className="mt-1 block text-right text-xs text-muted-foreground">
              {countCharacters(option.text)}/{POLL.MAX_OPTION_LENGTH}
            </span>
          </div>
          {poll.options.length > POLL.MIN_OPTIONS && (
            <button
              type="button"
              onClick={() => onRemoveOption(option.id)}
              disabled={disabled}
              aria-label={`Видалити варіант ${index + 1}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      {poll.options.length < POLL.MAX_OPTIONS && (
        <button
          type="button"
          onClick={onAddOption}
          disabled={disabled}
          className="flex min-h-9 items-center gap-1.5 self-start rounded-full px-2 text-sm font-medium text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
        >
          <Plus size={16} aria-hidden="true" />
          Додати варіант
        </button>
      )}
      {!isValid && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {error ?? "Заповніть щонайменше два варіанти відповіді."}
        </p>
      )}
    </PollCard>
  );
}
