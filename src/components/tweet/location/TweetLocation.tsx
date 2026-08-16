import { MapPin } from "lucide-react";

import type { Location } from "@/types/location";

interface Props {
  location: Location;
}

export default function TweetLocation({ location }: Props) {
  return (
    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
      <MapPin size={16} className="shrink-0" />
      <span>
        {location.name}, {location.country}
      </span>
    </div>
  );
}
