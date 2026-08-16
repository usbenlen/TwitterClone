import { MapPin, X } from "lucide-react";

import type { Location } from "@/types/location";

interface Props {
  location: Location;
  onRemove: () => void;
}

export default function TweetComposerLocationPreview({
  location,
  onRemove,
}: Props) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-full border border-border bg-background px-4 py-2">
      <div className="flex items-center gap-2 text-sm">
        <MapPin size={16} className="text-primary" />
        <span className="font-medium">{location.name}</span>
        <span className="text-muted-foreground">{location.country}</span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Видалити локацію"
      >
        <X size={16} />
      </button>
    </div>
  );
}
