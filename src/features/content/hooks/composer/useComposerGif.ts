import { useEffect, useState } from "react";

import { gifApi } from "@/features/content/api";
import { useComposerPopup } from "@/features/content/hooks/composer/useComposerPopup";
import { SEARCH_DEBOUNCE_MS } from "@/shared/constants/interaction";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

import type { Gif } from "@/features/content/types";

export function useComposerGif() {
  const popup = useComposerPopup();

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gifApi.available || !popup.isOpen || query !== debounced) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await gifApi.search(debounced, controller.signal);

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
  }, [popup.isOpen, query, debounced]);

  const close = () => {
    popup.close();
    setQuery("");
    setGifs([]);
    setError(null);
    setLoading(false);
  };

  return {
    ...popup,
    available: gifApi.available,
    close,
    toggle: () => (popup.isOpen ? close() : popup.open()),
    gifs: popup.isOpen && query === debounced ? gifs : [],
    query,
    loading: gifApi.available && popup.isOpen && (query !== debounced || loading),
    error: popup.isOpen && query === debounced ? error : null,
    setQuery,
  };
}
