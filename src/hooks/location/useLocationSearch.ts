/** @format */

import { useEffect, useState } from "react";

import { locationApi } from "@/api/location.api";
import { LOCATION_SEARCH_DEBOUNCE_MS } from "@/constants/app";

import type { Location } from "@/types/location";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setLocations([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await locationApi.search(normalizedQuery);

        if (!cancelled) setLocations(result);
      } catch {
        if (!cancelled) {
          setError("Не вдалося знайти локації.");
          setLocations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, LOCATION_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const reset = () => {
    setQuery("");
    setLocations([]);
    setLoading(false);
    setError(null);
  };

  return { query, setQuery, locations, loading, error, reset };
}
