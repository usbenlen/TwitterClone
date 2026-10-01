import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { SEARCH_DEBOUNCE_MS } from "@/constants/app";

import type { ListParams } from "@/admin/types";

type Choices<T> = Partial<Record<keyof T, readonly string[]>>;

export function readListParams<T extends ListParams>(
  search: URLSearchParams,
  defaults: T,
  choices: Choices<T>,
): T {
  const result = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = search.get(String(key));
    if (value === null) continue;

    if (key === "page") {
      const page = Number(value);
      result[key] = (
        Number.isSafeInteger(page) && page > 0 ? page : 1
      ) as T[keyof T];
    } else if (key === "search" || choices[key]?.includes(value))
      result[key] = value as T[keyof T];
  }

  return result;
}
export function useListParams<T extends ListParams>(
  defaults: T,
  choices: Choices<T>,
) {
  const [search, setSearch] = useSearchParams();
  const params = readListParams(search, defaults, choices);
  const debouncedSearch = useDebouncedValue(params.search, SEARCH_DEBOUNCE_MS);
  const queryParams = { ...params, search: debouncedSearch };

  const update = <K extends keyof T>(key: K, value: T[K], replace = false) => {
    setSearch(
      (previous) => {
        const next = new URLSearchParams(previous);

        if (value === defaults[key]) next.delete(String(key));
        else next.set(String(key), String(value));

        if (key !== "page") next.delete("page");

        return next;
      },
      { replace },
    );
  };

  const correctPage = (page: number | undefined) => {
    if (
      page !== undefined &&
      page !== params.page &&
      params.search === debouncedSearch
    )
      update("page", page as T["page"], true);
  };
  return {
    params,
    queryParams,
    update,
    correctPage,
    isSearching: params.search !== debouncedSearch,
  };
}

export function usePageSelection(ids: string[], scope: string) {
  const [selection, setSelection] = useState<{ scope: string; ids: string[] }>({
    scope,
    ids: [],
  });

  const selected =
    selection.scope === scope
      ? selection.ids.filter((id) => ids.includes(id))
      : [];

  const toggle = (id: string) =>
    setSelection({
      scope,
      ids: selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    });

  const set = (next: string[]) => setSelection({ scope, ids: next });

  return {
    selected,
    toggle,
    set,
    all: ids.length > 0 && ids.every((id) => selected.includes(id)),
    toggleAll: () => set(ids.every((id) => selected.includes(id)) ? [] : ids),
  };
}

export function useCorrectPage(
  page: number | undefined,
  requested: number,
  correct: (page: number | undefined) => void,
) {
  useEffect(() => {
    if (page !== requested) correct(page);
  }, [page, requested, correct]);
}
