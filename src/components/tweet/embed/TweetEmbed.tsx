/** @format */

import type { Embed } from "@/types/embed";

interface Props {
  embed: Embed;
}

export default function TweetEmbed({ embed }: Props) {
  return (
    <a
      href={embed.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex overflow-hidden rounded-2xl border border-border transition hover:bg-muted"
    >
      <img
        src={embed.thumbnailUrl}
        alt={embed.title}
        className="h-32 w-52 object-cover"
      />

      <div className="flex flex-col justify-center p-4">
        <div className="font-medium">{embed.title}</div>

        <div className="mt-1 text-sm text-muted-foreground">
          {embed.provider}
        </div>
      </div>
    </a>
  );
}
