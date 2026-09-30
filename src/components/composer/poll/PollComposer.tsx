import { POLL, POLL_DURATION_OPTIONS } from "@/constants/poll";
import { Plus, Trash2 } from "lucide-react";

import type { ComposerPoll } from "@/types/poll";

interface PollComposerProps {
  poll: ComposerPoll;

  onOptionChange: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;

  onDurationChange: (minutes: number) => void;
}

export default function PollComposer({
  poll,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onDurationChange,
}: PollComposerProps) {
  return (
    <div className="flex w-96 flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Створити опитування</h3>

      <div className="flex flex-col gap-2">
        {poll.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              value={option.text}
              onChange={(e) => onOptionChange(option.id, e.target.value)}
              placeholder={`Варіант ${index + 1}`}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />

            {poll.options.length > POLL.MIN_OPTIONS && (
              <button
                type="button"
                onClick={() => onRemoveOption(option.id)}
                className="flex size-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {poll.options.length < POLL.MAX_OPTIONS && (
        <button
          type="button"
          onClick={onAddOption}
          className="flex items-center gap-2 self-start rounded-full px-3 py-2 text-primary hover:bg-primary/10"
        >
          <Plus size={18} />
          Додати варіант
        </button>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Тривалість</span>

        <select
          value={poll.duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2"
        >
          {POLL_DURATION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
