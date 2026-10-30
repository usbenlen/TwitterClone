import PostLocation from "@/components/posts/PostLocation";

import type { Location } from "@/types/location";

interface Props {
  location: Location;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ComposerLocationPreview({
  location,
  onRemove,
  disabled = false,
}: Props) {
  return (
    <PostLocation
      location={location}
      onRemove={onRemove}
      disabled={disabled}
    />
  );
}
