/** @format */

import { MapPin } from "lucide-react";

import type { Location } from "@/types/location";

interface LocationPickerProps {
  locations: Location[];
  query: string;
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (location: Location) => void;
}

export default function LocationPicker({
  locations,
  query,
  loading,
  error,
  onQueryChange,
  onSelect,
}: LocationPickerProps) {
  return (
    <div className="w-full min-w-0 flex flex-col">
      <input
        autoFocus
        value={query}
        placeholder="Пошук місця..."
        onChange={(e) => onQueryChange(e.target.value)}
        className="border-b border-border bg-transparent px-4 py-3 outline-none"
      />

      <div className="max-h-80 overflow-y-auto">
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">
            Завантаження...
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-sm text-destructive">{error}</div>
        )}

        {!loading &&
          !error &&
          locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <MapPin size={18} className="text-muted-foreground" />

              <div className="flex flex-col">
                <span className="font-medium">{location.name}</span>

                <span className="text-sm text-muted-foreground">
                  {location.country}
                </span>
              </div>
            </button>
          ))}

        {!loading && !error && locations.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            Нічого не знайдено.
          </div>
        )}
      </div>
    </div>
  );
}
