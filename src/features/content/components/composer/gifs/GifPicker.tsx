import GifGrid from "@/features/content/components/composer/gifs/GifGrid";
import GifSearch from "@/features/content/components/composer/gifs/GifSearch";

import type { Gif } from "@/features/content/types";

interface GifPickerProps {
  available: boolean;
  gifs: Gif[];
  query: string;
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (gif: Gif) => void;
}

export default function GifPicker({
  available,
  gifs,
  query,
  loading,
  error,
  onQueryChange,
  onSelect,
}: GifPickerProps) {
  return (
    <div className="flex h-105 w-90 flex-col">
      <GifSearch value={query} onChange={onQueryChange} disabled={!available} />

      <div className="flex-1 overflow-y-auto">
        {!available && (
          <div role="status" className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            GIF недоступні в mock режимі.
          </div>
        )}

        {available && loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Завантаження...
          </div>
        )}

        {available && !loading && error && (
          <div className="p-6 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {available && !loading && !error && gifs.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            GIF не знайдено.
          </div>
        )}

        {available && !loading && !error && gifs.length > 0 && (
          <GifGrid gifs={gifs} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
