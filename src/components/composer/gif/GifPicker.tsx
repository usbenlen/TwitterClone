import { GifGrid, GifSearch } from "@/components/composer/gif";

import type { Gif } from "@/types/gif";

interface GifPickerProps {
  gifs: Gif[];
  query: string;
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (gif: Gif) => void;
}

export default function GifPicker({
  gifs,
  query,
  loading,
  error,
  onQueryChange,
  onSelect,
}: GifPickerProps) {
  return (
    <div className="flex h-105 w-90 flex-col">
      <GifSearch value={query} onChange={onQueryChange} />

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Завантаження...
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && gifs.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            GIF не знайдено.
          </div>
        )}

        {!loading && !error && gifs.length > 0 && (
          <GifGrid gifs={gifs} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
