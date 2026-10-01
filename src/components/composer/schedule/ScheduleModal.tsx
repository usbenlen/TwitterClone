import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  MONTH_OPTIONS,
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  SCHEDULE,
} from "@/constants";

import {
  daysInMonth,
  nextScheduledMinute,
  maximumScheduleDate,
  isScheduleDateValid,
  padDatePart,
  formatDateTime,
} from "@/utils";

import { createPortal } from "react-dom";
import { CalendarClock, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/ui";

interface ScheduleModalProps {
  open: boolean;
  initialAt?: string | null;
  title?: string;
  onClose: () => void;
  onApply: (scheduledAt: string) => void | Promise<void>;
  onClear?: () => void;
  onOpenScheduledPosts?: (draftAt: string) => void;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col rounded-md border border-border px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 min-w-0 bg-background text-base outline-none"
      >
        {children}
      </select>
    </label>
  );
}

export default function ScheduleModal({
  open,
  initialAt,
  title = "Запланувати",
  onClose,
  onApply,
  onClear,
  onOpenScheduledPosts,
}: ScheduleModalProps) {
  const initial = initialAt ? new Date(initialAt) : nextScheduledMinute();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [day, setDay] = useState(initial.getDate());
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());
  const [isSaving, setIsSaving] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const selectedDate = useMemo(
    () => new Date(year, month - 1, day, hour, minute, 0, 0),
    [year, month, day, hour, minute],
  );
  const maximumDate = useMemo(() => maximumScheduleDate(), []);
  const isValid = isScheduleDateValid(selectedDate, openedAt, maximumDate);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateLabel = formatDateTime(selectedDate, "full");

  const changeMonth = (value: number) => {
    setMonth(value);
    setDay((current) => Math.min(current, daysInMonth(year, value)));
  };
  const changeYear = (value: number) => {
    setYear(value);
    setDay((current) => Math.min(current, daysInMonth(value, month)));
  };

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-confirm-modal flex items-start justify-center bg-black/50 p-0 sm:p-4 sm:pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-background shadow-xl sm:h-auto sm:max-h-[calc(100vh-8rem)] sm:rounded-2xl">
        <header className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Закрити"
          >
            <X size={22} />
          </button>
          <h2 id="schedule-modal-title" className="flex-1 text-xl font-bold">
            {title}
          </h2>
          {initialAt && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full px-3 py-2 font-semibold hover:bg-muted"
            >
              Очистити
            </button>
          )}
          <Button
            onClick={async () => {
              if (!isValid || !isScheduleDateValid(selectedDate, Date.now(), maximumDate))
                return;
              setIsSaving(true);
              try {
                await onApply(selectedDate.toISOString());
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={!isValid}
            isLoading={isSaving}
          >
            Оновити
          </Button>
        </header>

        <div className="overflow-y-auto px-6 pb-6">
          <div className="mb-8 flex items-center gap-3 text-muted-foreground">
            <CalendarClock size={22} />
            <span>Буде надіслано: {dateLabel}</span>
          </div>

          <p className="mb-2 text-sm text-muted-foreground">Дата</p>
          <div className="flex gap-3">
            <SelectField label="Місяць" value={month} onChange={changeMonth}>
              {MONTH_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <SelectField label="День" value={day} onChange={setDay}>
              {Array.from(
                { length: daysInMonth(year, month) },
                (_, index) => index + 1,
              ).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </SelectField>
            <SelectField label="Рік" value={year} onChange={changeYear}>
              {Array.from(
                {
                  length:
                    maximumDate.getFullYear() - new Date().getFullYear() + 1,
                },
                (_, index) => new Date().getFullYear() + index,
              ).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </SelectField>
          </div>

          <p className="mb-2 mt-6 text-sm text-muted-foreground">Час</p>
          <div className="flex gap-3">
            <SelectField label="Година" value={hour} onChange={setHour}>
              {Array.from({ length: HOURS_PER_DAY }, (_, index) => index).map(
                (value) => (
                  <option key={value} value={value}>
                    {padDatePart(value)}
                  </option>
                ),
              )}
            </SelectField>
            <SelectField label="Хвилина" value={minute} onChange={setMinute}>
              {Array.from(
                { length: MINUTES_PER_HOUR },
                (_, index) => index,
              ).map((value) => (
                <option key={value} value={value}>
                  {padDatePart(value)}
                </option>
              ))}
            </SelectField>
          </div>

          {!isValid && (
            <p className="mt-3 text-sm text-destructive">
              Виберіть час від{" "}
              {SCHEDULE.MIN_DELAY_MINUTES === 1
                ? "наступної хвилини"
                : `${SCHEDULE.MIN_DELAY_MINUTES} хв затримки`}{" "}
              до {SCHEDULE.MAX_MONTHS_AHEAD} місяців наперед.
            </p>
          )}

          <div className="mt-7">
            <p className="text-sm text-muted-foreground">Часовий пояс</p>
            <p className="text-lg">{timezone}</p>
          </div>
        </div>

        {onOpenScheduledPosts && (
          <button
            type="button"
            onClick={() => onOpenScheduledPosts(selectedDate.toISOString())}
            className="border-t border-border px-6 py-4 text-left font-semibold text-primary hover:bg-muted/50"
          >
            Заплановані дописи
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
