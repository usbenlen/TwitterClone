/** @format */

import { useComposerPopup } from "@/hooks/composer";
import { useLocationSearch } from "@/hooks/location/useLocationSearch";

export function useComposerLocation() {
  const popup = useComposerPopup();
  const search = useLocationSearch();

  return {
    ...popup,

    query: search.query,
    setQuery: search.setQuery,

    locations: search.locations,

    loading: search.loading,
    error: search.error,
  };
}
