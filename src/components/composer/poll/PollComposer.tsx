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

            {poll.options.length > 2 && (
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

      {poll.options.length < 4 && (
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
          <option value={30}>30 хв</option>
          <option value={60}>1 година</option>
          <option value={360}>6 годин</option>
          <option value={720}>12 годин</option>
          <option value={1440}>1 день</option>
          <option value={4320}>3 дні</option>
          <option value={10080}>7 днів</option>
        </select>
      </div>
    </div>
  );
}
