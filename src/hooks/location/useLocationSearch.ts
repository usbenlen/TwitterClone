import { useEffect, useState } from "react";

import { locationApi } from "@/api/location.api";

import { LOCATION_SEARCH_DEBOUNCE_MS } from "@/constants/app";

import type { Location } from "@/types/location";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetQuery = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setLocations([]);
      setLoading(false);
      setError(null);
    }
  };

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) return;

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await locationApi.search(
          normalizedQuery,
          controller.signal,
        );

        if (!controller.signal.aborted) setLocations(result);
      } catch {
        if (!controller.signal.aborted) {
          setError("Не вдалося знайти локації.");
          setLocations([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, LOCATION_SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const reset = () => {
    setQuery("");
    setLocations([]);
    setLoading(false);
    setError(null);
  };

  return { query, setQuery: handleSetQuery, locations, loading, error, reset };
}
