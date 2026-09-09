import { useTweetComposer } from "@/hooks/composer";

import { Composer } from "@/components/composer";

import type { Tweet } from "@/types/tweet";

interface TweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export default function TweetComposer({ onCreated }: TweetComposerProps) {
  const composer = useTweetComposer({
    onCreated,
  });

  return (
    <Composer
      composer={composer}
      className="border-b border-border px-4 py-3"
    />
  );
}
