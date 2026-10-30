import Composer from "@/features/content/components/composer/Composer";
import { usePostComposer } from "@/features/content/hooks/composer/usePostComposer";

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
