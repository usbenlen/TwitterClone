/** @format */

import { useEffect, useState } from "react";

import { gifApi } from "@/api/gif.api";

import type { Gif } from "@/types/gif";

import { useComposerPopup } from "@/hooks/composer/useComposerPopup";

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

        const result = query.trim()
          ? await gifApi.search(query)
          : await gifApi.trending();

        if (!controller.signal.aborted) {
          setGifs(result);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Не вдалося завантажити GIF.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

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
