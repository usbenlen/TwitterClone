import { MapPin, X } from "lucide-react";

import type { Location } from "@/types/location";

interface Props {
  location: Location;
  onRemove?: () => void;
  disabled?: boolean;
}

export default function TweetLocation({
  location,
  onRemove,
  disabled = false,
}: Props) {
  return (
    <div className="mt-2 flex min-w-0">
      <div className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-2xl bg-muted/60 px-2.5 py-1.5 text-[13px] leading-5 text-muted-foreground">
        <MapPin
          size={14}
          className="shrink-0 text-primary/80"
          aria-hidden="true"
        />
        <span className="min-w-0 wrap-anywhere">
          <span className="font-medium text-foreground">{location.name}</span>
          {location.country && <span>, {location.country}</span>}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="-my-0.5 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            aria-label="Видалити локацію"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
