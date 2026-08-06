/** @format */

import { useEffect, useState } from "react";

import { locationApi } from "@/api/location.api";

import type { Location } from "@/types/location";

import { useComposerPopup } from "@/hooks/composer";

export function useComposerLocation() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popup = useComposerPopup();

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await locationApi.search(query);

        if (!cancelled) setLocations(result);
      } catch {
        if (!cancelled) setError("Не вдалося знайти локації.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return {
    ...popup,

    query,
    setQuery,

    locations,

    loading,
    error,
  };
}
