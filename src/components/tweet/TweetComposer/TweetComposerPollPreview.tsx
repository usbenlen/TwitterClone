/** @format */

import { Trash2 } from "lucide-react";

import type { ComposerPoll } from "@/types/poll";

interface Props {
  poll: ComposerPoll;
  onRemove: () => void;
}

export default function TweetComposerPollPreview({ poll, onRemove }: Props) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold">Опитування</h4>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-2 hover:bg-muted"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {poll.options.map((option, index) => (
          <div
            key={option.id}
            className="rounded-xl border border-border px-3 py-2"
          >
            {option.text || `Варіант ${index + 1}`}
          </div>
        ))}
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Тривалість: {poll.duration} хв
      </div>
    </div>
  );
}
