/** @format */

import { X } from "lucide-react";

import type { Embed } from "@/types/embed";

interface Props {
  embed: Embed;
  onRemove: () => void;
}

export default function TweetComposerEmbedPreview({ embed, onRemove }: Props) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-border">
      <div className="flex">
        <img
          src={embed.thumbnailUrl}
          alt={embed.title}
          className="h-24 w-40 object-cover"
        />

        <div className="flex flex-1 flex-col justify-center px-4">
          <div className="font-medium">{embed.title}</div>

          <div className="mt-1 text-sm text-muted-foreground">
            {embed.provider}
          </div>
        </div>

        <button type="button" onClick={onRemove} className="p-3">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
