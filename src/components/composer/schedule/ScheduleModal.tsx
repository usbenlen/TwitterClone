import { useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { ChevronLeft, ChevronRight, Clock3, Pencil } from "lucide-react";

import { APP_LOCALE, HOURS_PER_DAY, MINUTES_PER_HOUR } from "@/constants";
import {
  cn,
  daysInMonth,
  isScheduleDateValid,
  maximumScheduleDate,
  nextScheduledMinute,
  padDatePart,
} from "@/utils";
import { Button, Modal } from "@/ui";

interface ScheduleModalProps {
  open: boolean;
  initialAt?: string | null;
  title?: string;
  returnFocus?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onApply: (scheduledAt: string) => void;
  onClear?: () => void;
  onOpenScheduledPosts?: (draftAt: string | null) => void;
}

const weekLength = 7;
const monthFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "long",
  year: "numeric",
});
const dayFormat = new Intl.DateTimeFormat(APP_LOCALE, { dateStyle: "long" });
const weekdayFormat = new Intl.DateTimeFormat(APP_LOCALE, { weekday: "short" });
const weekdays = Array.from({ length: weekLength }, (_, index) =>
  weekdayFormat.format(new Date(2024, 0, index + 1)),
);
const dayArrowOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -weekLength,
  ArrowDown: weekLength,
};
const timeInputClass = "h-12 w-11 rounded-md bg-transparent text-center text-[22px] font-semibold tabular-nums focus-visible:focus-indicator";

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function ScheduleModal({
  open,
  initialAt,
  title = "Запланувати допис",
  returnFocus,
  onClose,
  onApply,
  onClear,
  onOpenScheduledPosts,
}: ScheduleModalProps) {
  const [{ openedAt, earliest, latest, initial }] = useState(() => {
    const openedAt = Date.now();
    const earliest = nextScheduledMinute(openedAt);
    const latest = maximumScheduleDate(new Date(openedAt));
    const existing = initialAt ? new Date(initialAt) : earliest;
    return {
      openedAt,
      earliest: dayStart(earliest),
      latest,
      initial: isScheduleDateValid(existing, openedAt, latest)
        ? existing
        : earliest,
    };
  });
  const [day, setDay] = useState(() => dayStart(initial));
  const [month, setMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [hour, setHour] = useState(() => padDatePart(initial.getHours()));
  const [minute, setMinute] = useState(() => padDatePart(initial.getMinutes()));
  const [focusedDay, setFocusedDay] = useState<number>();
  const [expired, setExpired] = useState(false);
  const hourInput = useRef<HTMLInputElement>(null);
  const minuteInput = useRef<HTMLInputElement>(null);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = (month.getDay() + weekLength - 1) % weekLength;
  const lastDay = daysInMonth(year, monthIndex + 1);
  const latestDay = dayStart(latest);
  const previousMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const firstEnabledDay = month < earliest ? earliest.getDate() : 1;
  const lastEnabledDay = nextMonth > latestDay ? latest.getDate() : lastDay;
  const tabStop = focusedDay ?? (day >= month && day < nextMonth ? day.getDate() : firstEnabledDay);

  const selected = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Number(hour),
    Number(minute),
  );
  const valid =
    hour !== "" &&
    minute !== "" &&
    Number(hour) < HOURS_PER_DAY &&
    Number(minute) < MINUTES_PER_HOUR &&
    selected.getHours() === Number(hour) &&
    selected.getMinutes() === Number(minute) &&
    isScheduleDateValid(selected, openedAt, latest);

  function showMonth(date: Date) {
    setMonth(date);
    setFocusedDay(undefined);
  }

  function moveDayFocus(event: KeyboardEvent<HTMLButtonElement>, number: number) {
    const offset = dayArrowOffsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = Math.max(firstEnabledDay, Math.min(lastEnabledDay, number + offset));
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-calendar-day="${next}"]`)
      ?.focus();
  }

  function changeTime(setValue: (value: string) => void, value: string) {
    setValue(value.replace(/\D/g, "").slice(0, 2));
    setExpired(false);
  }

  function apply() {
    const now = Date.now();
    if (!valid || !isScheduleDateValid(selected, now, maximumScheduleDate(new Date(now)))) {
      setExpired(true);
      return;
    }
    onApply(selected.toISOString());
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      returnFocus={returnFocus}
      className="max-h-[calc(100dvh-2rem)] max-w-[380px] rounded-[20px] p-5 sm:max-w-[440px]"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Попередній місяць"
          disabled={
            previousMonth <
            new Date(earliest.getFullYear(), earliest.getMonth(), 1)
          }
          onClick={() => showMonth(previousMonth)}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </Button>
        <h3 aria-live="polite" className="text-center font-bold capitalize">
          {monthFormat.format(month)}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Наступний місяць"
          disabled={nextMonth > latestDay}
          onClick={() => showMonth(nextMonth)}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </Button>
      </div>

      <div
        className="mb-1 grid grid-cols-7 text-center text-xs text-muted-foreground"
        aria-hidden="true"
      >
        {weekdays.map((label, index) => (
          <span key={index} className="capitalize">
            {label}
          </span>
        ))}
      </div>
      <div
        className="grid grid-cols-7"
        role="group"
        aria-label="Дата публікації"
      >
        {Array.from({ length: 6 * weekLength }, (_, cell) => {
          const number = cell - offset + 1;
          if (number < 1 || number > lastDay) return <span key={cell} className="h-[42px]" />;

          const candidate = new Date(year, monthIndex, number);
          const selectedDay = candidate.getTime() === day.getTime();
          return (
            <button
              key={cell}
              data-calendar-day={number}
              type="button"
              aria-label={dayFormat.format(candidate)}
              aria-pressed={selectedDay}
              disabled={candidate < earliest || candidate > latestDay}
              tabIndex={number === tabStop ? 0 : -1}
              onFocus={() => setFocusedDay(number)}
              onKeyDown={(event) => moveDayFocus(event, number)}
              onClick={() => {
                setDay(candidate);
                setExpired(false);
              }}
              className="group flex min-h-[42px] items-center justify-center rounded-lg text-sm focus-visible:focus-indicator disabled:opacity-40"
            >
              <span
                className={cn(
                  "grid size-[34px] max-w-full place-items-center rounded-full",
                  selectedDay
                    ? "bg-primary font-bold text-primary-foreground"
                    : "group-enabled:group-hover:bg-muted",
                )}
              >
                {number}
              </span>
            </button>
          );
        })}
      </div>

      <fieldset className="mt-3 min-w-0">
        <legend className="mb-1.5 text-sm font-semibold">Час публікації</legend>
        <div className="inline-flex items-center rounded-xl border border-border bg-transparent pr-1 pl-3">
          <Clock3
            size={18}
            className="text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={hourInput}
            type="text"
            inputMode="numeric"
            aria-label="Години"
            placeholder="ГГ"
            maxLength={2}
            value={hour}
            onChange={(event) => changeTime(setHour, event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={() => hour && setHour(hour.padStart(2, "0"))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                minuteInput.current?.focus();
              }
            }}
            className={timeInputClass}
          />
          <span
            aria-hidden="true"
            className="text-[22px] text-muted-foreground"
          >
            :
          </span>
          <input
            ref={minuteInput}
            type="text"
            inputMode="numeric"
            aria-label="Хвилини"
            placeholder="ХХ"
            maxLength={2}
            value={minute}
            onChange={(event) => changeTime(setMinute, event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={() => minute && setMinute(minute.padStart(2, "0"))}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            className={timeInputClass}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Редагувати час"
            onClick={() => hourInput.current?.focus()}
            className="size-9 text-muted-foreground"
          >
            <Pencil size={15} aria-hidden="true" />
          </Button>
        </div>
      </fieldset>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {dayFormat.format(day)} · місцевий час
      </p>
      {(!valid || expired) && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Виберіть коректний майбутній час.
        </p>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2.5">
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="mr-auto"
          >
            Очистити
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onClose}>
          Скасувати
        </Button>
        <Button
          type="button"
          onClick={apply}
          disabled={!valid || expired}
          className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary-hover"
        >
          Застосувати
        </Button>
      </div>
      {onOpenScheduledPosts && (
        <button
          type="button"
          onClick={() =>
            onOpenScheduledPosts(
              valid && !expired ? selected.toISOString() : null,
            )
          }
          className="-mx-5 -mb-5 mt-3 flex min-h-11 w-[calc(100%+2.5rem)] items-center justify-center border-t border-border px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:focus-indicator"
        >
          Заплановані дописи
        </button>
      )}
    </Modal>
  );
}
