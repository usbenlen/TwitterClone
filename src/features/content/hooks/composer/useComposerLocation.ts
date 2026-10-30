import { useComposerPopup } from "@/features/content/hooks/composer/useComposerPopup";
import { useLocationSearch } from "@/features/content/hooks/composer/useLocationSearch";

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
