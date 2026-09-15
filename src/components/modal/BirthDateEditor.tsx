import type { BirthDateVisibility } from "@/types";
import type { ReactNode } from "react";

interface BirthDateEditorProps {
  month: string;
  day: string;
  year: string;
  dateVisibility: BirthDateVisibility;
  yearVisibility: BirthDateVisibility;
  canRemove: boolean;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onDateVisibilityChange: (value: BirthDateVisibility) => void;
  onYearVisibilityChange: (value: BirthDateVisibility) => void;
  onCancel: () => void;
  onRemove: () => void;
}

const VISIBILITY_OPTIONS: Array<{
  value: BirthDateVisibility;
  label: string;
}> = [
  { value: "public", label: "Загальнодоступно" },
  { value: "followers", label: "Ваші підписники" },
  { value: "following", label: "Люди, яких ви читаєте" },
  { value: "mutual", label: "Ви читаєте одне одного" },
  { value: "only_me", label: "Лише ви" },
];

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: new Date(2000, index, 1).toLocaleDateString("uk-UA", {
    month: "long",
  }),
}));

const SELECT_CLASS = "h-14 w-full cursor-pointer rounded-lg border border-border bg-background px-3 pt-4 text-foreground outline-none transition focus:ring-2 focus:ring-ring";

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1.5 z-content text-xs text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASS}
      >
        {children}
      </select>
    </label>
  );
}

export default function BirthDateEditor({
  month,
  day,
  year,
  dateVisibility,
  yearVisibility,
  canRemove,
  onMonthChange,
  onDayChange,
  onYearChange,
  onDateVisibilityChange,
  onYearVisibilityChange,
  onCancel,
  onRemove,
}: BirthDateEditorProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const selectedYear = Number(year) || 2000;
  const selectedMonth = Number(month) || 1;
  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth,
    0,
  ).getDate();
  const maxDay =
    Number(year) === currentYear && Number(month) === today.getMonth() + 1
      ? Math.min(daysInSelectedMonth, today.getDate())
      : daysInSelectedMonth;

  return (
    <section className="space-y-5 rounded-xl border border-border p-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Дата народження</h3>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-sm font-medium text-primary hover:underline"
          >
            Скасувати
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Вкажіть дату народження людини, яка користується цим акаунтом.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_0.8fr_1fr]">
        <SelectField label="Місяць" value={month} onChange={onMonthChange}>
          <option value="" disabled>
            Оберіть
          </option>
          {MONTHS.map((item) => (
            <option
              key={item.value}
              value={item.value}
              disabled={
                Number(year) === currentYear &&
                Number(item.value) > today.getMonth() + 1
              }
            >
              {item.label}
            </option>
          ))}
        </SelectField>

        <SelectField label="День" value={day} onChange={onDayChange}>
          <option value="" disabled>
            Оберіть
          </option>
          {Array.from({ length: maxDay }, (_, index) => String(index + 1)).map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </SelectField>

        <SelectField label="Рік" value={year} onChange={onYearChange}>
          <option value="" disabled>
            Оберіть
          </option>
          {Array.from(
            { length: currentYear - 1899 },
            (_, index) => String(currentYear - index),
          ).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
      </div>

      <div>
        <h3 className="font-semibold">Хто це бачить?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ви можете окремо налаштувати видимість дати та року народження.
        </p>
      </div>

      <div className="space-y-3">
        <SelectField
          label="Місяць і день"
          value={dateVisibility}
          onChange={(value) =>
            onDateVisibilityChange(value as BirthDateVisibility)
          }
        >
          {VISIBILITY_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Рік"
          value={yearVisibility}
          onChange={(value) =>
            onYearVisibilityChange(value as BirthDateVisibility)
          }
        >
          {VISIBILITY_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectField>
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-full cursor-pointer py-1 text-center text-sm font-medium text-destructive hover:underline"
        >
          Видалити дату народження
        </button>
      )}
    </section>
  );
}
