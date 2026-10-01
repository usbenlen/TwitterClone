import { useEffect, useState } from "react";

import { gifApi } from "@/api/gif.api";

import { useComposerPopup } from "@/hooks/composer/useComposerPopup";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SEARCH_DEBOUNCE_MS } from "@/constants/app";

import type { Gif } from "@/types/gif";

export function useComposerGif() {
  const popup = useComposerPopup();

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!popup.isOpen || query !== debounced) return;

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
    close,
    toggle: () => (popup.isOpen ? close() : popup.open()),
    gifs: popup.isOpen && query === debounced ? gifs : [],
    query,
    loading: popup.isOpen && (query !== debounced || loading),
    error: popup.isOpen && query === debounced ? error : null,
    setQuery,
  };
}
