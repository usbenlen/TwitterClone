import TweetLocation from "@/components/tweet/location/TweetLocation";

import type { Location } from "@/types/location";

interface Props {
  location: Location;
  onRemove: () => void;
  disabled?: boolean;
}

export default function TweetComposerLocationPreview({
  location,
  onRemove,
  disabled = false,
}: Props) {
  return (
    <TweetLocation
      location={location}
      onRemove={onRemove}
      disabled={disabled}
    />
  );
}
