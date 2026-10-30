import { usePostComposer } from "@/hooks/composer/usePostComposer";

import Composer from "@/components/composer/Composer";

export default function PostComposer() {
  const composer = usePostComposer({
    allowScheduling: true,
  });

  return (
    <Composer
      composer={composer}
      className="border-b border-border px-4 py-3"
    />
  );
}
