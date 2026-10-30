import PostLocation from "@/features/content/components/posts/PostLocation";

import type { Location } from "@/features/content/types";

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
