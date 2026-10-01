import { RadioOption } from "@/ui/RadioOption";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button, Input } from "@/ui";
import {
  DEFAULT_SEARCH_CRITERIA,
  SEARCH_NEARBY_RADIUS_KM,
} from "@/constants/search";

import type {
  SearchCriteria,
  SearchLocation,
  SearchPeople,
} from "@/types";

interface AdvancedSearchModalProps {
  criteria: SearchCriteria;
  viewerHasLocation: boolean;
  onApply: (criteria: SearchCriteria) => void;
  onClose: () => void;
}

export default function AdvancedSearchModal({
  criteria,
  viewerHasLocation,
  onApply,
  onClose,
}: AdvancedSearchModalProps) {
  const [draft, setDraft] = useState<SearchCriteria>(criteria);
  const [dateError, setDateError] = useState("");

  useBodyScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const setText = (field: keyof SearchCriteria, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const setCount = (
    field: "minReplies" | "minLikes" | "minReposts",
    value: string,
  ) => {
    const parsed = Number(value);
    setDraft((current) => ({
      ...current,
      [field]:
        value === "" || !Number.isFinite(parsed)
          ? undefined
          : Math.max(0, Math.floor(parsed)),
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draft.fromDate && draft.toDate && draft.fromDate > draft.toDate) {
      setDateError("The end date cannot be earlier than the start date.");
      return;
    }

    onApply({
      ...draft,
      type: "posts",
      query: draft.query.trim(),
      exactPhrase: draft.exactPhrase.trim(),
      anyWords: draft.anyWords.trim(),
      excludeWords: draft.excludeWords.trim(),
      from: draft.from.trim().replace(/^@+/, ""),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-start justify-center bg-black/50 p-0 sm:p-4 sm:pt-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-search-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="flex h-full w-full max-w-150 flex-col overflow-hidden bg-background shadow-xl sm:max-h-[calc(100vh-5rem)] sm:rounded-2xl sm:border sm:border-border"
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close advanced search"
            >
              <X className="size-5" />
            </button>
            <h2
              id="advanced-search-title"
              className="truncate text-xl font-bold"
            >
              Advanced search
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(DEFAULT_SEARCH_CRITERIA);
                setDateError("");
              }}
            >
              Clear all
            </Button>
            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-6">
          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-bold">Words</legend>
            <Input
              autoFocus
              label="All of these words"
              value={draft.query}
              onChange={(event) => setText("query", event.target.value)}
              placeholder="React TypeScript"
            />
            <Input
              label="This exact phrase"
              value={draft.exactPhrase}
              onChange={(event) => setText("exactPhrase", event.target.value)}
              placeholder="show me the code"
            />
            <Input
              label="Any of these words"
              value={draft.anyWords}
              onChange={(event) => setText("anyWords", event.target.value)}
              placeholder="frontend, backend"
            />
            <Input
              label="None of these words"
              value={draft.excludeWords}
              onChange={(event) => setText("excludeWords", event.target.value)}
              placeholder="vacancy advertisement"
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-bold">Accounts</legend>
            <Input
              label="From this account"
              prefix="@"
              value={draft.from}
              onChange={(event) => setText("from", event.target.value)}
              placeholder="username"
            />
            <div role="radiogroup" aria-label="People" className="space-y-1">
              <RadioOption<SearchPeople>
                className="py-1 text-left"
                checked={draft.people === "anyone"}
                label="From anyone"
                value="anyone"
                onChange={(people) =>
                  setDraft((current) => ({ ...current, people }))
                }
              />
              <RadioOption<SearchPeople>
                className="py-1 text-left"
                checked={draft.people === "following"}
                label="People you follow"
                value="following"
                onChange={(people) =>
                  setDraft((current) => ({ ...current, people }))
                }
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-bold">Location</legend>
            <div role="radiogroup" aria-label="Location" className="space-y-1">
              <RadioOption<SearchLocation>
                className="py-1 text-left"
                checked={draft.location === "anywhere"}
                label="Anywhere"
                value="anywhere"
                onChange={(location) =>
                  setDraft((current) => ({ ...current, location }))
                }
              />
              <RadioOption<SearchLocation>
                className="py-1 text-left"
                checked={draft.location === "near"}
                disabled={!viewerHasLocation}
                label={`Near you (within ${SEARCH_NEARBY_RADIUS_KM} km)`}
                value="near"
                onChange={(location) =>
                  setDraft((current) => ({ ...current, location }))
                }
              />
            </div>
            {!viewerHasLocation && (
              <p className="text-xs text-muted-foreground">
                Add a location to your profile to use nearby search.
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-bold">Engagement</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                type="number"
                min="0"
                step="1"
                label="Minimum replies"
                value={draft.minReplies ?? ""}
                onChange={(event) => setCount("minReplies", event.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="1"
                label="Minimum likes"
                value={draft.minLikes ?? ""}
                onChange={(event) => setCount("minLikes", event.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="1"
                label="Minimum reposts"
                value={draft.minReposts ?? ""}
                onChange={(event) => setCount("minReposts", event.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-bold">Dates</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="date"
                label="From"
                max={draft.toDate || undefined}
                value={draft.fromDate}
                onChange={(event) => {
                  setText("fromDate", event.target.value);
                  setDateError("");
                }}
              />
              <Input
                type="date"
                label="To"
                min={draft.fromDate || undefined}
                value={draft.toDate}
                onChange={(event) => {
                  setText("toDate", event.target.value);
                  setDateError("");
                }}
              />
            </div>
            {dateError && (
              <p className="text-sm text-destructive" role="alert">
                {dateError}
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-lg font-bold">Media</legend>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.hasMedia}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    hasMedia: event.target.checked,
                  }))
                }
                className="size-4 accent-primary"
              />
              Only show posts with media
            </label>
          </fieldset>
        </div>
      </form>
    </div>,
    document.body,
  );
}
