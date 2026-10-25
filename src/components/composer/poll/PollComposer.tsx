import { useEffect, useId, useRef, type RefObject } from "react";
import { Plus, X } from "lucide-react";

import PollCard from "@/components/tweet/poll/PollCard";
import PollOptionImage from "@/components/composer/poll/PollOptionImage";

import { Tooltip } from "@/ui/Tooltip";

import { POLL } from "@/constants/poll";
import { HOURS_PER_DAY, MINUTES_PER_HOUR } from "@/constants/date";

import { countCharacters, getPollError } from "@/utils/composerRules";
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
  imageErrors?: Record<string, string>;
  onOptionFocus?: (id: string, input: HTMLInputElement) => void;
  onImageSelect?: (id: string, file: File) => void;
  onImageRemove?: (id: string) => void;
  onImageRetry?: (id: string) => void;
}

const minutesPerDay = HOURS_PER_DAY * MINUTES_PER_HOUR;

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
  imageErrors = {},
  onOptionFocus,
  onImageSelect,
  onImageRemove,
  onImageRetry,
}: PollComposerProps) {
  const id = useId();
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const previousOptions = useRef(poll.options);
  const days = Math.floor(poll.duration / minutesPerDay);
  const hours = Math.floor((poll.duration % minutesPerDay) / MINUTES_PER_HOUR);
  const minutes = poll.duration % MINUTES_PER_HOUR;
  const maxDays = Math.floor(POLL.MAX_DURATION_MINUTES / minutesPerDay);
  const canAddOption = poll.options.length < POLL.MAX_OPTIONS;
  const canRemoveOption = poll.options.length > POLL.MIN_OPTIONS;
  const error = poll.options.some((option) => option.image && !option.text.trim())
    ? "Додайте текст до варіанта з фото"
    : getPollError(
        poll.options.map((option) => option.text),
        poll.duration,
      );
  const durationFields = [
    {
      key: "days",
      label: "Дні",
      value: days,
      max: maxDays,
      onChange: (value: number) =>
        onDurationChange(
          value === maxDays
            ? POLL.MAX_DURATION_MINUTES
            : value * minutesPerDay + hours * MINUTES_PER_HOUR + minutes,
        ),
    },
    {
      key: "hours",
      label: "Години",
      value: hours,
      max: HOURS_PER_DAY - 1,
      onChange: (value: number) =>
        onDurationChange(
          days * minutesPerDay + value * MINUTES_PER_HOUR + minutes,
        ),
    },
    {
      key: "minutes",
      label: "Хвилини",
      value: minutes,
      max: MINUTES_PER_HOUR - 1,
      onChange: (value: number) =>
        onDurationChange(
          days * minutesPerDay + hours * MINUTES_PER_HOUR + value,
        ),
    },
  ];

  useEffect(() => {
    firstOptionRef.current?.focus();
  }, [firstOptionRef]);

  useEffect(() => {
    const previous = previousOptions.current;
    const added = poll.options.find(
      (option) => !previous.some(({ id }) => id === option.id),
    );
    if (added) inputs.current.get(added.id)?.focus();
    previousOptions.current = poll.options;
  }, [poll.options]);

  return (
    <PollCard
      busy={disabled}
      footer={
        <>
          <fieldset disabled={disabled} className="min-w-0">
            <legend className="mb-2 text-sm font-semibold text-foreground">
              Тривалість опитування
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {durationFields.map((field) => (
                <label
                  key={field.key}
                  className="flex min-h-14 min-w-0 flex-col justify-center rounded-sm border border-border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-ring"
                  htmlFor={`${id}-${field.key}`}
                >
                  {field.label}
                  <select
                    id={`${id}-${field.key}`}
                    value={field.value}
                    disabled={
                      disabled || (days === maxDays && field.key !== "days")
                    }
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    aria-describedby={error ? `${id}-hint` : undefined}
                    className="w-full min-w-0 bg-background text-base text-foreground outline-none disabled:opacity-50"
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
          </fieldset>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="-mx-3 -mb-3 mt-3 flex min-h-11 w-[calc(100%+1.5rem)] items-center justify-center border-t border-border px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:focus-indicator disabled:opacity-50"
          >
            Видалити опитування
          </button>
        </>
      }
    >
      {poll.options.map((option, index) => {
        const length = countCharacters(option.text);
        return (
          <div key={option.id} className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <PollOptionImage
                index={index}
                image={option.image}
                disabled={disabled}
                onSelect={(file) => onImageSelect?.(option.id, file)}
                onRemove={() => onImageRemove?.(option.id)}
                onRetry={() => onImageRetry?.(option.id)}
              />
              <label
                className="group relative flex min-h-14 min-w-0 flex-1 flex-col justify-center rounded-xl border border-border px-3 py-2 transition-colors focus-within:inset-ring-2 focus-within:inset-ring-primary hover:bg-muted/30"
                htmlFor={`${id}-${option.id}`}
              >
                <span className="pr-9 text-xs whitespace-nowrap text-muted-foreground group-focus-within:text-primary">
                  Варіант {index + 1}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-2 right-3 text-xs tabular-nums text-muted-foreground",
                    length < POLL.MAX_OPTION_LENGTH &&
                      "invisible group-focus-within:visible",
                  )}
                >
                  {length}/{POLL.MAX_OPTION_LENGTH}
                </span>
                <input
                  id={`${id}-${option.id}`}
                  ref={(node) => {
                    if (node) inputs.current.set(option.id, node);
                    else inputs.current.delete(option.id);
                    if (index === 0) firstOptionRef.current = node;
                  }}
                  value={option.text}
                  onFocus={(event) =>
                    onOptionFocus?.(option.id, event.currentTarget)
                  }
                  disabled={disabled}
                  onChange={(event) =>
                    onOptionChange(option.id, event.target.value)
                  }
                  aria-describedby={
                    [
                      !isValid ? `${id}-hint` : "",
                      imageErrors[option.id]
                        ? `${id}-${option.id}-image-error`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  aria-invalid={
                    countCharacters(option.text.trim()) >
                      POLL.MAX_OPTION_LENGTH || undefined
                  }
                  className="w-full min-w-0 bg-transparent text-base text-foreground outline-none disabled:opacity-50"
                />
              </label>
              <div
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1 min-[420px]:flex-row",
                  canAddOption && canRemoveOption
                    ? "w-9 min-[420px]:w-18"
                    : "w-9",
                )}
              >
                {canRemoveOption && (
                  <button
                    type="button"
                    onClick={() => {
                      const neighbor =
                        poll.options[index - 1] ?? poll.options[index + 1];
                      onRemoveOption(option.id);
                      if (neighbor) inputs.current.get(neighbor.id)?.focus();
                    }}
                    disabled={disabled}
                    aria-label={`Видалити варіант ${index + 1}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:focus-indicator disabled:opacity-50"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
                {canAddOption && index === poll.options.length - 1 && (
                  <Tooltip label="Додати варіант">
                    <button
                      type="button"
                      onClick={onAddOption}
                      disabled={disabled}
                      aria-label="Додати варіант"
                      className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:focus-indicator disabled:opacity-50"
                    >
                      <Plus size={20} aria-hidden="true" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
            {imageErrors[option.id] && (
              <p
                id={`${id}-${option.id}-image-error`}
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {imageErrors[option.id]}
              </p>
            )}
          </div>
        );
      })}
      {!isValid && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {error ?? "Заповніть щонайменше два варіанти відповіді."}
        </p>
      )}
    </PollCard>
  );
}
