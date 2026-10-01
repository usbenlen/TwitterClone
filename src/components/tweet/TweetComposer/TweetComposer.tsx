import { useTweetComposer } from "@/hooks";

import { Composer } from "@/components/composer/index";

export default function TweetComposer() {
  const composer = useTweetComposer({
    allowScheduling: true,
  });

  return (
    <Composer
      composer={composer}
      className="border-b border-border px-4 py-3"
    />
  );
}
