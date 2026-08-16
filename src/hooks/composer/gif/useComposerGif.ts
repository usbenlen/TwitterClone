import { useEffect, useState } from "react";

import { gifApi } from "@/api/gif.api";

import { useComposerPopup } from "@/hooks/composer/useComposerPopup";

import type { Gif } from "@/types/gif";

export function useComposerGif() {
  const popup = useComposerPopup();

  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!popup.isOpen) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await gifApi.search(query);

        if (!controller.signal.aborted) setGifs(result);
      } catch {
        if (!controller.signal.aborted) {
          setGifs([]);
          setError("Не вдалося завантажити GIF.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [popup.isOpen, query]);

  return {
    ...popup,
    gifs,
    query,
    loading,
    error,
    setQuery,
  };
}
