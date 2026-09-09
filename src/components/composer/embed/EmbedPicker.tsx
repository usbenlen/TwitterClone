import type { Embed } from "@/types/embed";

interface EmbedPickerProps {
  url: string;
  embed: Embed | null;
  loading: boolean;
  error: string | null;
  onUrlChange: (value: string) => void;
  onResolve: () => void;
  onSelect: (embed: Embed) => void;
}

export default function EmbedPicker({
  url,
  embed,
  loading,
  error,
  onUrlChange,
  onResolve,
  onSelect,
}: EmbedPickerProps) {
  return (
    <div className="flex w-96 flex-col">
      <div className="border-b border-border p-4">
        <input
          value={url}
          placeholder="Вставте URL YouTube або Vimeo..."
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 outline-none"
        />

        <button
          type="button"
          onClick={onResolve}
          disabled={loading || !url.trim()}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Завантаження..." : "Додати"}
        </button>
      </div>

      {error && <div className="p-4 text-sm text-destructive">{error}</div>}

      {embed && (
        <button
          type="button"
          onClick={() => onSelect(embed)}
          className="flex gap-3 p-4 text-left transition hover:bg-muted"
        >
          <img
            src={embed.thumbnailUrl}
            alt={embed.title}
            className="h-20 w-32 rounded-lg object-cover"
          />

          <div className="flex flex-col">
            <span className="font-medium">{embed.title}</span>

            <span className="mt-1 text-sm text-muted-foreground">
              {embed.provider}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
